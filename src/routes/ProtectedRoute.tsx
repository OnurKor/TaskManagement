import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';
import { checkSession } from '../utils/authHelper';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn } = useAppSelector((state) => state.user);
  
  useEffect(() => {
    // Oturum durumunu kontrol et ve gerekirse güncelle
    if (!isLoggedIn) {
      checkSession();
    }
  }, [isLoggedIn]);
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  // Kullanıcı giriş yapmışsa, çocuk elementleri render et
  return <>{children}</>;
};

export default ProtectedRoute;
