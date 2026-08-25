import { IAuthToken } from './token';
import { IAuthUser } from './user';

export interface ILoginResponse {
  tokens: IAuthToken;
  user: IAuthUser;
};

export interface ILoginRequestPayload {
  email: string;
  password: string;
};
