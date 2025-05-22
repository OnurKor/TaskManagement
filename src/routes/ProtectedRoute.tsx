import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { checkSession } from '../features/auth/services/authService';
import LoadingAuth from '../shared/components/LoadingAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component to secure routes that require authentication
 * Uses our token refresh mechanism to ensure uninterrupted user experience
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, accessToken } = useAppSelector((state) => state.user);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    const verifyAuth = async () => {
      setChecking(true);
      
      try {
        // Quick check from Redux store first
        if (isLoggedIn && accessToken) {
          setAuthorized(true);
          setChecking(false);
          return;
        }
        
        // Quick check from localStorage before making API call
        const userStateStr = localStorage.getItem('userState');
        if (userStateStr) {
          try {
            const localUserState = JSON.parse(userStateStr);
            if (localUserState.isLoggedIn && localUserState.accessToken) {
              // Set authorized immediately to prevent loading flicker
              setAuthorized(true);
              setChecking(false);
              
              // In the background, sync with checkSession to update Redux
              checkSession().catch(e => console.error('Session check failed:', e));
              return;
            }
          } catch (e) {
            console.error('localStorage parsing error:', e);
          }
        }
        
        // Check session with Supabase as a last resort
        const sessionValid = await checkSession();
        setAuthorized(sessionValid);
      } catch (error) {
        console.error('Authorization check error:', error);
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };
    
    verifyAuth();
  }, [isLoggedIn, accessToken]);
  
  // Show loading indicator while checking authentication
  if (checking) {
    return <LoadingAuth />;
  }
  
  // Redirect to login if not authorized
  if (!authorized) {
    return <Navigate to="/login" />;
  }
  
  // User is authenticated, render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
