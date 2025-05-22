import { useEffect, useState } from 'react';
import './App.css'
import { supabase } from './shared/utils/supabaseClient';
import { checkSession } from './features/auth/services/authService';
import LoadingAuth from './shared/components/LoadingAuth';
import AppRouter from './routes/Routes';

function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Initialize authentication when the app starts
    const initializeAuth = async () => {
      // First try to get session from localStorage to avoid flicker
      const userStateStr = localStorage.getItem('userState');
      if (userStateStr) {
        try {
          const localUserState = JSON.parse(userStateStr);
          if (localUserState.isLoggedIn && localUserState.accessToken) {
            // End initialization immediately
            setIsInitializing(false);
            
            // Check session in background
            checkSession().catch(e => console.error('Session check failed:', e));
            return;
          }
        } catch (e) {
          console.error('localStorage parsing error:', e);
        }
      }
      
      // If no valid localStorage session, check with API
      await checkSession();
      setIsInitializing(false);
    };
    
    initializeAuth();
    
    // Listen for Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await checkSession();
      }
    });
    
    // No need for manual token refresh interval as our
    // axios interceptor will handle token refresh automatically
    
    return () => {
      // Clean up auth listener subscription
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Show loading screen during initialization
  if (isInitializing) {
    return <LoadingAuth />;
  }
  
  return <AppRouter />;
}

export default App
