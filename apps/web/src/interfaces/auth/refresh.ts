import type { IGenericAxiosResponse, } from '../shared/generic-response';
import type { IAuthToken } from './token';
import type { IAuthUser } from './user';

export interface IRefreshResponse {
  tokens: IAuthToken;
  user: IAuthUser;
};

export type IRefreshAxiosResponse = IGenericAxiosResponse<IRefreshResponse>;
