import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import components needed for auth integration test
import Login from '../pages/Login';
import Register from '../pages/Register';
import userReducer from '../../../store/slices/userSlice';
import { server } from '../../../test/mocks/server';

// Mock store 
const createTestStore = () => configureStore({
  reducer: {
    user: userReducer
  }
});

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test',
  surname: 'User'
};

// Set up custom handlers for auth integration tests
beforeEach(() => {
  server.use(
    // Login endpoint
    http.post('/api/auth/login', async ({ request }) => {
      const { email, password } = await request.json() as { email: string; password: string };
      
      if (email === 'test@example.com' && password === 'password123') {
        return HttpResponse.json({
          user: mockUser,
          session: {
            access_token: 'fake-access-token',
            refresh_token: 'fake-refresh-token',
            expires_at: Date.now() + 3600000 // 1 hour from now
          }
        });
      }
      
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }),
    
    // Register endpoint
    http.post('/api/auth/signup', async ({ request }) => {
      const { email, password, name, surname } = await request.json() as { email: string; password: string; name: string; surname: string };
      
      if (email && password && name && surname) {
        return HttpResponse.json({
          user: {
            id: 'new-user-123',
            email,
            name,
            surname
          },
          session: {
            access_token: 'fake-access-token',
            refresh_token: 'fake-refresh-token',
            expires_at: Date.now() + 3600000 // 1 hour from now
          }
        }, { status: 201 });
      }
      
      return HttpResponse.json({ error: 'Invalid registration data' }, { status: 400 });
    })
  );
  
  // Clear localStorage before each test
  localStorage.clear();
  // Reset mocks
  vi.resetAllMocks();
});

// Mock navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('Authentication Flow', () => {
  it('should allow a user to log in successfully', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    
    // Wait for the login form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });
    
    // Fill out the login form
    await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'password123');
    
    // Submit the login form
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for login success and check that the user is redirected or authenticated
    await waitFor(() => {
      // Check Redux store was updated with user data
      const state = store.getState();
      expect({
        id: state.user.id,
        email: state.user.email,
        name: state.user.name,
        surname: state.user.surname
      }).toEqual(mockUser);
      expect(state.user.isLoggedIn).toBe(true);
      
      // Check localStorage was updated with tokens
      expect(localStorage.getItem('accessToken')).toBe('fake-access-token');
    });
  });
  
  it('should display an error message on login failure', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    
    // Override the login handler for this specific test
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { error: 'Invalid credentials' }, 
          { status: 401 }
        );
      })
    );
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill out the login form with invalid credentials
    await user.type(screen.getByLabelText(/Email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    
    // Submit the login form
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
    
    // Verify user is not authenticated in store
    const state = store.getState();
    expect(state.user.isLoggedIn).toBe(false);
    expect(state.user.id).toBe(null);
    expect(state.user.email).toBe(null);
    expect(state.user.name).toBe(null);
    expect(state.user.surname).toBe(null);
  });
  
  it('should allow a user to register successfully', async () => {
    const user = userEvent.setup();
    const store = createTestStore();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    );
    
    // Wait for the registration form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });
    
    // Fill out the registration form
    await user.type(screen.getByLabelText(/Name/i), 'New');
    await user.type(screen.getByLabelText(/Surname/i), 'User');
    await user.type(screen.getByLabelText(/Email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/Password/i), 'newpassword123');
    
    // Submit the registration form
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));
    
    // Wait for registration success
    await waitFor(() => {
      const state = store.getState();
      expect(state.user.isLoggedIn).toBe(true);
      expect({
        id: state.user.id,
        email: state.user.email,
        name: state.user.name,
        surname: state.user.surname
      }).toEqual({
        id: 'new-user-123',
        email: 'new@example.com',
        name: 'New',
        surname: 'User'
      });
      
      // Check localStorage was updated with tokens
      expect(localStorage.getItem('accessToken')).toBe('fake-access-token');
    });
  });
});
