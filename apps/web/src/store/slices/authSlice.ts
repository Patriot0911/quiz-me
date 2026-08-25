import type { IAuthStoreState } from '@/interfaces/auth/store';
import { IAuthToken } from '@/interfaces/auth/token';
import AuthService, { ACCESS_TOKEN_KEY } from '@/lib/services/auth.service';
import { createSlice, PayloadAction, } from '@reduxjs/toolkit';

const initialState: IAuthStoreState = {
  status: 'init',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.status = 'guest';
      AuthService.clearTokens();
    },
    initAuth: (state) => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      AuthService.setToken(accessToken);
      state.status = accessToken ? 'authenticated' : 'guest';
    },
    login: (state, action: PayloadAction<IAuthToken>) => {
      AuthService.updateTokens(action.payload.accessToken, action.payload.refreshToken);
      state.status = 'authenticated';
    },
  },
});

export const { logout, initAuth, login, } = authSlice.actions;
export default authSlice.reducer;
