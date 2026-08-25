import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/services/users.service';
import { Role } from 'src/modules/users/enums/role.enum';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { PasswordService } from './password.service';
import { AuthMapper } from '../mappers/auth.mapper';
import { ILoginModel } from '../models/login.model';
import { IRegisterModel } from '../models/register.model';
import { IAccessTokenPayload } from '../models/access-token-payload.model';
import { IRefreshTokenPayload } from '../models/refresh-token-payload.model';
import { IAuthResponse } from '../models/auth-response.model';
import { IUserPayload } from '../models/user-payload.model';
import { ITokenModel } from '../models/token.model';
import { TokenType } from '../models/token-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly authMapper: AuthMapper,
  ) {}

  async login(data: ILoginModel): Promise<IAuthResponse> {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) throw new BadRequestException('Invalid credentials');

    const isValidPassword = await this.passwordService.verify(
      user.password,
      data.password,
    );
    if (!isValidPassword) throw new BadRequestException('Invalid credentials');

    return this.issueTokensFor(user);
  }

  async register(data: IRegisterModel): Promise<IAuthResponse> {
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) throw new BadRequestException('Email is already in use');

    const hashedPassword = await this.passwordService.hash(data.password);
    const user = await this.usersService.create({
      email: data.email,
      fullName: data.fullName,
      password: hashedPassword,
      role: Role.USER,
    });

    return this.issueTokensFor(user);
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<IAuthResponse> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const isValid = await this.passwordService.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!isValid) throw new UnauthorizedException();

    return this.issueTokensFor(user);
  }

  async logout(userId: string): Promise<boolean> {
    await this.usersService.updateRefreshToken(userId, null);
    return true;
  }

  async getMe(userId: string): Promise<IUserPayload> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    return this.authMapper.userEntityToUserPayload(user);
  }

  async verifyRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) return false;
    return this.passwordService.verify(user.refreshToken, refreshToken);
  }

  private async issueTokensFor(user: UserEntity): Promise<IAuthResponse> {
    const tokens = await this.generateTokens(user.id, user.role);
    await this.usersService.updateRefreshToken(
      user.id,
      await this.passwordService.hash(tokens.refreshToken),
    );
    await this.usersService.markLoggedIn(user.id);
    return this.authMapper.entitiesToAuth(tokens, user);
  }

  private async generateTokens(
    userId: string,
    role: Role,
  ): Promise<ITokenModel> {
    const accessPayload: IAccessTokenPayload = {
      use: TokenType.Access,
      sub: userId,
      role,
    };
    const refreshPayload: IRefreshTokenPayload = {
      use: TokenType.Refresh,
      sub: userId,
    };

    const accessToken = await this.signTokenPayload(
      accessPayload,
      TokenType.Access,
    );
    const refreshToken = await this.signTokenPayload(
      refreshPayload,
      TokenType.Refresh,
    );

    return { accessToken, refreshToken };
  }

  private async signTokenPayload(
    payload: IAccessTokenPayload | IRefreshTokenPayload,
    type: TokenType,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get(`auth.jwt.ttl.${type}`),
      secret: this.configService.get(`auth.jwt.secret.${type}`),
    });
  }
}
