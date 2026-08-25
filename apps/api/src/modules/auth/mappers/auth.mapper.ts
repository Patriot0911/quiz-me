import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { IUserPayload } from '../models/user-payload.model';
import { IAuthResponse } from '../models/auth-response.model';
import { ITokenModel } from '../models/token.model';

@Injectable()
export class AuthMapper {
  userEntityToUserPayload(user: UserEntity): IUserPayload {
    const { id, email, fullName, role } = user;
    return { id, email, fullName, role };
  }

  entitiesToAuth(tokens: ITokenModel, user: UserEntity): IAuthResponse {
    return {
      tokens,
      user: this.userEntityToUserPayload(user),
    };
  }
}
