import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from '../features/dashboard/pages/Dashboard';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ProtectedRoute from './ProtectedRoute';

const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Login />,
    },
    {
      path: '/home',
      element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
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
