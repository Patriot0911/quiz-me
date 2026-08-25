import { Role } from '../enums/role.enum';

export interface ICreateUserModel {
  email: string;
  fullName: string;
  password: string;
  role?: Role;
}
