import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { AuthMapper } from './mappers/auth.mapper';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PassportModule, UsersModule, JwtModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtService,
    AuthMapper,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [],
})
export class AuthModule {}
