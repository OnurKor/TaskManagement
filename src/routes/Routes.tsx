import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/home',
    element: <App />,
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

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
