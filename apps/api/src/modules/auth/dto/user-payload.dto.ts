import { ApiProperty } from '@nestjs/swagger';
import type { IUserPayload } from '../models/user-payload.model';
import { Role } from 'src/modules/users/enums/role.enum';

export class UserPayloadDto implements IUserPayload {
  @ApiProperty({ type: 'string' })
  id: string;

  @ApiProperty({ type: 'string', example: 'example@gmail.com' })
  email: string;

  @ApiProperty({ type: 'string', example: 'Cillian Murphy' })
  fullName: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;
}
