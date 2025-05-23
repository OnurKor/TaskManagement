import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkSession, refreshSession, signOut } from '../authService';
import { supabase } from '../../../../shared/utils/supabaseClient';
import { store } from '../../../../store/store';
import { setUser, clearUser } from '../../../../store/slices/userSlice';

// Mock dependencies
vi.mock('../../../../shared/utils/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        refreshSession: vi.fn(),
        signOut: vi.fn()
      }
    }
  };
});

vi.mock('../../../../store/store', () => ({
  store: {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({
      user: {
        id: null,
        email: null,
        name: null,
        surname: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        isLoggedIn: false
      }
    }))
  }
}));

vi.mock('../../../../store/slices/userSlice', () => ({
  setUser: vi.fn(payload => ({ type: 'user/setUser', payload })),
  clearUser: vi.fn(() => ({ type: 'user/clearUser' }))
}));

describe('authService', () => {
  let localStorageMock: {
    getItem: ReturnType<typeof vi.fn>;
    setItem: ReturnType<typeof vi.fn>;
    removeItem: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    key: ReturnType<typeof vi.fn>;
    length: number;
  };

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock localStorage
    localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Set up mock implementations for Supabase methods
    (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    (supabase.auth.refreshSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: null
    });
    
    (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkSession', () => {
    it('should return true if valid user state found in localStorage', async () => {
      // Setup
      const mockUserState = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        isLoggedIn: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserState));
      
      // Execute
      const result = await checkSession();
      
      // Verify
      expect(result).toBe(true);
      expect(store.dispatch).toHaveBeenCalledWith(setUser({
        id: mockUserState.id,
        email: mockUserState.email,
        name: mockUserState.name,
        surname: mockUserState.surname,
        accessToken: mockUserState.accessToken,
        refreshToken: mockUserState.refreshToken,
        expiresAt: mockUserState.expiresAt
      }));
      expect(localStorageMock.getItem).toHaveBeenCalledWith('userState');
      // Should not call supabase if localStorage has valid token
      expect(supabase.auth.getSession).not.toHaveBeenCalled();
    });

    it('should refresh token if expiring soon', async () => {
      // Setup
      const mockUserState = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test',
        surname: 'User',
        accessToken: 'valid-token',
        refreshToken: 'valid-refresh-token',
        expiresAt: Math.floor(Date.now() / 1000) + 200, // expiring soon
        isLoggedIn: true
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUserState));
      
      // Mock refreshSession without touching the original implementation
      const globalWithRefreshSession = global as typeof globalThis & { refreshSession?: any };
      const originalRefreshSession = globalWithRefreshSession.refreshSession;
      const mockRefreshSessionFn = vi.fn().mockResolvedValue(true);
      globalWithRefreshSession.refreshSession = mockRefreshSessionFn;
      
      try {
        // Execute
        const result = await checkSession();
        
        // Verify
        expect(result).toBe(true);
        expect(store.dispatch).toHaveBeenCalledWith(setUser(expect.objectContaining({
          id: mockUserState.id
        })));
        expect(localStorageMock.getItem).toHaveBeenCalledWith('userState');
      } finally {
        // Restore the original function
        globalWithRefreshSession.refreshSession = originalRefreshSession;
      }
    });

    it('should check supabase session if no localStorage data', async () => {
      // Setup
      localStorageMock.getItem.mockReturnValue(null);
      
      const mockSessionData = {
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: {
                display_name: 'Test User'
              }
            },
            access_token: 'valid-token',
            refresh_token: 'valid-refresh-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          }
        },
        error: null
      };
      
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockSessionData);
      
      // Execute
      const result = await checkSession();
      
      // Verify
      expect(result).toBe(true);
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(setUser(expect.objectContaining({
        id: 'user-123',
        email: 'test@example.com'
      })));
    });

    it('should return false if no session found', async () => {
      // Setup
      localStorageMock.getItem.mockReturnValue(null);
      
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Execute
      const result = await checkSession();
      
      // Verify
      expect(result).toBe(false);
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(clearUser());
    });

    it('should handle errors gracefully', async () => {
      // Setup
      localStorageMock.getItem.mockReturnValue(null);
      
      (supabase.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error('Session error')
      });
      
      // Execute
      const result = await checkSession();
      
      // Verify
      expect(result).toBe(false);
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(clearUser());
    });
  });

  describe('refreshSession', () => {
    it('should return true when refresh succeeds', async () => {
      // Setup
      const refreshToken = 'valid-refresh-token';
      
      const mockRefreshData = {
        data: {
          session: {
            access_token: 'new-token',
            refresh_token: 'new-refresh-token',
            expires_at: Math.floor(Date.now() / 1000) + 3600
          },
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              display_name: 'Test User'
            }
          }
        },
        error: null
      };
      
      (supabase.auth.refreshSession as ReturnType<typeof vi.fn>).mockResolvedValue(mockRefreshData);
      
      // Execute
      const result = await refreshSession(refreshToken);
      
      // Verify
      expect(result).toBe(true);
      expect(supabase.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken
      });
      expect(store.dispatch).toHaveBeenCalledWith(setUser(expect.objectContaining({
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token'
      })));
    });

    it('should return false when refresh fails', async () => {
      // Setup
      const refreshToken = 'invalid-refresh-token';
      
      (supabase.auth.refreshSession as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error: new Error('Invalid refresh token')
      });
      
      // Execute
      const result = await refreshSession(refreshToken);
      
      // Verify
      expect(result).toBe(false);
      expect(supabase.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: refreshToken
      });
      expect(store.dispatch).toHaveBeenCalledWith(clearUser());
    });

    it('should return false when refresh token is missing', async () => {
      // Execute
      const result = await refreshSession('');
      
      // Verify
      expect(result).toBe(false);
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut and clear user state', async () => {
      // Setup
      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: null
      });
      
      // Execute
      const result = await signOut();
      
      // Verify
      expect(result).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(store.dispatch).toHaveBeenCalledWith(clearUser());
    });

    it('should handle signOut errors', async () => {
      // Setup
      const mockError = new Error('Logout failed');
      (supabase.auth.signOut as ReturnType<typeof vi.fn>).mockResolvedValue({
        error: mockError
      });
      
      // Execute
      const result = await signOut();
      
      // Verify
      expect(result).toBe(false);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
