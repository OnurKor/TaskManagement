import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import AppRouter from './routes/Routes.tsx'
import { store } from './redux/store'
import { checkSession } from './utils/authHelper'

// Uygulama başladığında oturum kontrolü yap
const AppWithSessionCheck = () => {
  useEffect(() => {
    checkSession();
  }, []);
  
  return <AppRouter />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AppWithSessionCheck />
    </Provider>
  </StrictMode>,
)
