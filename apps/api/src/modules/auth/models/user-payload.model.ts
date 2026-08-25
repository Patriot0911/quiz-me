import { Role } from 'src/modules/users/enums/role.enum';

export interface IUserPayload {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}
