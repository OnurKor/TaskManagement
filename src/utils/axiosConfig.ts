import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { store } from '../redux/store';
import { refreshTokenSuccess, clearUser } from '../redux/slices/userSlice';
import { supabase } from './supabaseClient';

// Axios instance'ını oluştur
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - her istekte token ekle
api.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const { accessToken, expiresAt, refreshToken } = state.user;
    
    // Token var ve süresi dolmak üzere veya dolmuşsa yenile
    if (accessToken && expiresAt && refreshToken) {
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Token'ın süresinin dolmasına 5 dakika veya daha az kaldıysa yenile
      if (expiresAt - currentTime < 300) {
        try {
          const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
          });
          
          if (error) {
            throw error;
          }
          
          if (data && data.session) {
            // Redux store'u güncelle
            store.dispatch(refreshTokenSuccess({
              accessToken: data.session.access_token,
              expiresAt: data.session.expires_at,
            }));
            
            // Yeni token ile isteği devam ettir
            config.headers['Authorization'] = `Bearer ${data.session.access_token}`;
          }
        } catch (error) {
          console.error('Token yenilenirken hata:', error);
          store.dispatch(clearUser());
          window.location.href = '/login';
        }
      } else {
        // Token hala geçerli, mevcut token ile devam et
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata durumunda yönlendirme
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Kimlik doğrulama hatası, oturumu temizle ve login'e yönlendir
      store.dispatch(clearUser());
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
