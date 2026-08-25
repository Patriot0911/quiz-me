import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity';
import { UsersService } from './services/users.service';
import { PasswordResetService } from './services/password-reset.service';
import { PasswordService } from '../auth/services/password.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PasswordResetTokenEntity])],
  providers: [UsersService, PasswordResetService, PasswordService],
  exports: [UsersService, PasswordResetService],
})
export class UsersModule {}
