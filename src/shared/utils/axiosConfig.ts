import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { store } from '../../store/store';
import { clearUser } from '../../store/slices/userSlice';
import { refreshSession } from '../../features/auth/services/authService';

// Define a type for queued requests
interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

// Token refresh state management
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

/**
 * Process all queued requests with either the new token or error
 * @param error - Error that occurred during refresh, if any
 * @param token - New access token if refresh was successful
 */
const processQueue = (error: any, token: string | null = null): void => {
  failedQueue.forEach(item => {
    if (error) {
      item.reject(error);
    } else {
      // Update the authorization header with new token
      if (token && item.config.headers) {
        item.config.headers['Authorization'] = `Bearer ${token}`;
      }
      item.resolve(axios(item.config));
    }
  });
  
  // Clear the queue after processing
  failedQueue = [];
};

// Create Axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  timeout: 10000 // 10 seconds timeout for requests
});

/**
 * Request interceptor to add authentication token to all outgoing requests
 */
api.interceptors.request.use(
  (config): InternalAxiosRequestConfig => {
    const state = store.getState();
    const accessToken = state.user?.accessToken;
    
    // Add auth header if token exists
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return config;
  },
  (error): Promise<never> => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor that handles token refresh when 401 errors occur
 */
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    // Safe access to config with type assertion
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If token refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve, 
            reject,
            config: originalRequest
          });
        });
      }
      
      // Mark request as retried and set refreshing flag
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to get refresh token from Redux store first
        const state = store.getState();
        let refreshToken = state.user?.refreshToken;
        
        // If not in Redux, try localStorage as backup
        if (!refreshToken) {
          const userStateStr = localStorage.getItem('userState');
          if (userStateStr) {
            try {
              const localUserState = JSON.parse(userStateStr);
              refreshToken = localUserState.refreshToken;
            } catch (e) {
              console.error('localStorage parsing error:', e);
            }
          }
        }
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call refresh session function with refresh token
        const success = await refreshSession(refreshToken);
        
        if (success) {
          // Get new tokens from the updated store
          const updatedState = store.getState();
          const newAccessToken = updatedState.user?.accessToken;
          
          if (!newAccessToken) {
            throw new Error('Failed to get new access token after refresh');
          }
          
          // Update current request authorization header
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          }
          
          // Process any queued requests with new token
          processQueue(null, newAccessToken);
          
          // Retry the original request with new token
          return axios(originalRequest);
        } else {
          console.error('Axios: Session refresh failed');
          throw new Error('Session refresh failed');
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        
        // Reject all queued requests
        processQueue(refreshError, null);
        
        // Clear user session
        store.dispatch(clearUser());
        
        // Redirect to login page in browser environment
        if (typeof window !== 'undefined') {
          // Add a small delay to allow state updates
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
        
        return Promise.reject(refreshError);
      } finally {
        // Reset refreshing flag
        isRefreshing = false;
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

// Make the API instance available globally for testing purposes only in development mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).api = api;
}

export default api;
