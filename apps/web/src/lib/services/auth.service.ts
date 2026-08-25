import type { ILoginRequestPayload, ILoginResponse } from '@/interfaces/auth/login';
import type { IRegisterRequestPayload, IRegisterResponse } from '@/interfaces/auth/register';
import type { IRefreshResponse } from '@/interfaces/auth/refresh';
import { IAuthMeResponse } from '@/interfaces/auth/me';
import { apiConfig, apiClient, } from '../axios';
import axios from 'axios';

export const REFRESH_TOKEN_KEY = 'refresh_token';
export const ACCESS_TOKEN_KEY = 'access_token';

export enum AuthQueryKey {
  Me = 'me',
};

class AuthService {
  private static token: string | null = null;

  static setToken(token: string | null) {
    AuthService.token = token;
  }

  static updateTokens(accessToken: string, refreshToken?: string) {
    AuthService.setToken(accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static clearTokens() {
    AuthService.setToken(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static getToken(): string | null {
    return AuthService.token;
  }

  static async logout(): Promise<boolean> {
    return apiClient.post('/auth/logout');
  }

  static async login(credentials: ILoginRequestPayload): Promise<ILoginResponse> {
    return apiClient.post('/auth/login', credentials);
  }

  static async register(data: IRegisterRequestPayload): Promise<IRegisterResponse> {
    return apiClient.post('/auth/register', data);
  }

  static async refreshToken(): Promise<IRefreshResponse> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return axios.post('/auth/refresh', {}, {
      ...apiConfig,
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  }

  static async getMeUser(): Promise<IAuthMeResponse> {
    return apiClient.get('/auth/me');
  }
}

export default AuthService;
