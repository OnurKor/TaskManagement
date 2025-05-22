import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

// Make store available globally for testing only in development mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).store = store;
}

// Redux için tip tanımlamaları
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
