import { Role } from 'src/modules/users/enums/role.enum';
import { TokenType } from './token-type.enum';

export interface IAccessTokenPayload {
  use: TokenType.Access;
  sub: string;
  role: Role;
}
