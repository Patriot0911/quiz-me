import axios, { AxiosError, AxiosResponse } from 'axios';
import AuthService from './services/auth.service';
import { getGlobalStore } from '../store/storeRef';
import { logout } from '@/store/slices/authSlice';
import { IRefreshAxiosResponse } from '@/interfaces/auth/refresh';

let isRefreshing = false;
let queue: (() => void)[] = [];

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
};
export const apiClient = axios.create(apiConfig);

// Auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = AuthService.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    AuthService.setToken(null);

    original._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve) => queue.push(resolve));
      return apiClient(original);
    }

    isRefreshing = true;

    try {
      const { data: { data, } } = <IRefreshAxiosResponse> (await AuthService.refreshToken() as unknown);

      AuthService.updateTokens(data.tokens.accessToken, data.tokens.refreshToken);
      queue.forEach((cb) => cb());
      queue = [];

      return apiClient(original);
    } catch(err) {
      getGlobalStore()?.dispatch(logout());
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (typeof response?.status !== 'number' || !response?.headers) {
      return response;
    }
    return response.data?.data ?? response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }

    if (error.request) {
      return Promise.reject({
        status: false,
        message: 'No response from server. Check your connection.',
      });
    }

    return Promise.reject({
      status: false,
      message: error.message ?? 'Unexpected error occurred.',
    });
  },
);
