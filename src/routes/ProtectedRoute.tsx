import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { checkSession } from '../utils/authHelper';
import LoadingAuth from '../components/LoadingAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, accessToken, refreshToken } = useAppSelector((state) => state.user);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Oturum durumunu kontrol et ve gerekirse güncelle
    const verifyAuth = async () => {
      setChecking(true);
      
      try {
        // Zaten giriş yapmışsa
        if (isLoggedIn && accessToken) {
          setAuthorized(true);
          setChecking(false);
          return;
        }
        
        // localStorage'dan kontrol et
        const userStateStr = localStorage.getItem('userState');
        if (userStateStr) {
          const userState = JSON.parse(userStateStr);
          if (userState.isLoggedIn && userState.accessToken) {
            setAuthorized(true);
            setChecking(false);
            return;
          }
        }
        
        // Refresh token varsa, oturumu yenilemeyi dene
        if (refreshToken || (userStateStr && JSON.parse(userStateStr).refreshToken)) {
          const sessionResult = await checkSession();
          setAuthorized(sessionResult === true);
        } else {
          setAuthorized(false);
        }
      } catch (error) {
        console.error('Yetkilendirme kontrolü sırasında hata:', error);
        setAuthorized(false);
      } finally {
        setChecking(false);
      }
    };
    
    verifyAuth();
  }, [isLoggedIn, accessToken, refreshToken]);
  
  // Kontrol sürüyor
  if (checking) {
    return <LoadingAuth />;
  }
  
  // Kullanıcı yetkili değilse login sayfasına yönlendir
  if (!authorized) {
    return <Navigate to="/login" />;
  }
  
  // Kullanıcı giriş yapmışsa, çocuk elementleri render et
  return <>{children}</>;
};

export default ProtectedRoute;
