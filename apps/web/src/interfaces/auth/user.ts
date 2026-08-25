import { Role } from '@/enums/role.enum';

export interface IAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};
