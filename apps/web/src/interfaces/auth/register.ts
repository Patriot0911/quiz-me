import { IAuthToken } from './token';
import { IAuthUser } from './user';

export interface IRegisterResponse {
  tokens: IAuthToken;
  user: IAuthUser;
};

export interface IRegisterRequestPayload {
  email: string;
  password: string;
  fullName: string;
};
