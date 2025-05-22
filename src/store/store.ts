import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})

// Make store available globally for testing
if (typeof window !== 'undefined') {
  (window as any).store = store;
};

// Redux için tip tanımlamaları
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
