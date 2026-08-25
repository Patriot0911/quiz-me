import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { PasswordResetTokenEntity } from '../entities/password-reset-token.entity';
import { PasswordService } from 'src/modules/auth/services/password.service';
import { IPasswordResetTokenModel } from '../models/password-reset-token.model';
import { UsersService } from './users.service';

const TOKEN_SEPARATOR = '.';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private passwordResetTokensRepository: Repository<PasswordResetTokenEntity>,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async createResetToken(userId: string): Promise<IPasswordResetTokenModel> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    await this.passwordResetTokensRepository.delete({
      userId,
      usedAt: IsNull(),
    });

    const selector = randomBytes(16).toString('hex');
    const validator = randomBytes(32).toString('hex');
    const validatorHash = await this.passwordService.hash(validator);
    const ttlSeconds =
      this.configService.get<number>('auth.passwordReset.ttl') ?? 86400;
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const resetToken = this.passwordResetTokensRepository.create({
      userId,
      selector,
      validatorHash,
      expiresAt,
    });
    await this.passwordResetTokensRepository.save(resetToken);

    return {
      token: `${selector}${TOKEN_SEPARATOR}${validator}`,
      expiresAt,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const [selector, validator] = token.split(TOKEN_SEPARATOR);
    if (!selector || !validator) {
      throw new BadRequestException('Invalid or expired token');
    }

    const resetToken = await this.passwordResetTokensRepository.findOne({
      where: { selector },
    });
    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isValidToken = await this.passwordService.verify(
      resetToken.validatorHash,
      validator,
    );
    if (!isValidToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await this.passwordService.hash(newPassword);
    await this.usersService.updatePassword(resetToken.userId, hashedPassword);

    resetToken.usedAt = new Date();
    await this.passwordResetTokensRepository.save(resetToken);

    return true;
  }
}
