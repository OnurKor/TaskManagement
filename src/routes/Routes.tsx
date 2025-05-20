import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from './ProtectedRoute';
import { useEffect } from 'react';
import { checkSession } from '../utils/authHelper';

const AppRouter = () => {
  // Uygulama başlatıldığında oturum durumunu kontrol et
  useEffect(() => {
    checkSession();
  }, []);

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/home',
      element: <ProtectedRoute><App /></ProtectedRoute>,
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
  ]);
  
  return <RouterProvider router={router} />;
};

export default AppRouter;
