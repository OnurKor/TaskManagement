import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import AppRouter from './routes/Routes.tsx'
import { store } from './redux/store'
import { checkSession } from './utils/authHelper'
import { supabase } from './utils/supabaseClient'
import LoadingAuth from './components/LoadingAuth'

// Uygulama başladığında oturum kontrolü yap
const AppWithSessionCheck = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Uygulama her başlatıldığında oturum durumunu kontrol et
    const initializeAuth = async () => {
      console.log('Oturum durumu kontrol ediliyor...');
      await checkSession();
      setIsInitializing(false);
    };
    
    initializeAuth();
    
    // Supabase auth değişikliklerini dinle
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkSession();
      } else if (event === 'SIGNED_OUT') {
        // localStorage'dan temizleme işlemi userSlice içinde yapılıyor
      }
    });
    
    // Belli aralıklarla token yenileme kontrolü yap (her 5 dakikada bir)
    const tokenRefreshInterval = setInterval(() => {
      const userStateStr = localStorage.getItem('userState');
      if (userStateStr) {
        try {
          const userState = JSON.parse(userStateStr);
          if (userState.isLoggedIn && userState.refreshToken) {
            console.log('Periyodik token kontrolü yapılıyor...');
            checkSession();
          }
        } catch (e) {
          console.error('Token kontrol hatası:', e);
        }
      }
    }, 5 * 60 * 1000); // 5 dakikada bir
    
    return () => {
      clearInterval(tokenRefreshInterval);
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  if (isInitializing) {
    return <LoadingAuth />;
  }
  
  return <AppRouter />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWithSessionCheck />
    </Provider>
  </StrictMode>,
)
