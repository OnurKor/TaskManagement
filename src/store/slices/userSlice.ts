import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UserState {
  id: string | null
  email: string | null
  name: string | null
  surname: string | null
  isLoggedIn: boolean
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null | undefined
}

// Local storage'dan durumu yükle
const loadState = (): UserState => {
  try {
    const serializedState = localStorage.getItem('userState');
    if (serializedState === null) {
      return {
        id: null,
        email: null,
        name: null,
        surname: null,
        isLoggedIn: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return {
      id: null,
      email: null,
      name: null,
      surname: null,
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };
  }
};

// Başlangıç state'i
const initialState: UserState = loadState()

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, 'isLoggedIn'>>) => {
      state.id = action.payload.id
      state.email = action.payload.email
      state.name = action.payload.name
      state.surname = action.payload.surname
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.expiresAt = action.payload.expiresAt
      state.isLoggedIn = true
      
      // State'i localStorage'a kaydet
      localStorage.setItem('userState', JSON.stringify({
        ...state
      }));
    },
    // İşte eklediğimiz refreshTokenSuccess
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ accessToken: string; expiresAt: number | null | undefined }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.expiresAt = action.payload.expiresAt
      
      // Güncellenen state'i localStorage'a kaydet
      localStorage.setItem('userState', JSON.stringify({
        ...state
      }));
    },
    // For token refresh testing purposes
    forceTokenExpiration: (state, action: PayloadAction<number>) => {
      state.expiresAt = action.payload;
      
      // Update localStorage
      localStorage.setItem('userState', JSON.stringify({
        ...state
      }));
    },
    clearUser: (state) => {
      state.id = null
      state.email = null
      state.name = null
      state.surname = null
      state.accessToken = null
      state.refreshToken = null
      state.expiresAt = null
      state.isLoggedIn = false
      
      // localStorage'dan temizle
      localStorage.removeItem('userState');
    },
  },
})

export const { setUser, refreshTokenSuccess, clearUser, forceTokenExpiration } = userSlice.actions
export default userSlice.reducer
