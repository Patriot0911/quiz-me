import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { RegistrationDto } from '../dto/registration.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAccessGuard } from '../guards/jwt-access.guard';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { AuthService } from '../services/auth.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { IAccessTokenPayload } from '../models/access-token-payload.model';
import type { IRefreshTokenPayloadWithToken } from '../models/refresh-token-payload.model';
import { IAuthResponse } from '../models/auth-response.model';
import { IUserPayload } from '../models/user-payload.model';
import { ApiGenericResponses } from 'src/shared/factories/api-generic-responses.factory';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { PasswordResetService } from 'src/modules/users/services/password-reset.service';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async login(@Body() data: LoginDto): Promise<IAuthResponse> {
    return this.authService.login(data);
  }

  @Post('register')
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async register(@Body() data: RegistrationDto): Promise<IAuthResponse> {
    return this.authService.register(data);
  }

  @Post('refresh')
  @ApiBearerAuth()
  @UseGuards(JwtRefreshGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: AuthResponseDto })
  async refresh(
    @CurrentUser() user: IRefreshTokenPayloadWithToken,
  ): Promise<IAuthResponse> {
    return this.authService.refreshToken(user.sub, user.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  async logout(@CurrentUser() user: IAccessTokenPayload): Promise<boolean> {
    return this.authService.logout(user.sub);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.OK]: UserPayloadDto })
  async me(@CurrentUser() user: IAccessTokenPayload): Promise<IUserPayload> {
    return this.authService.getMe(user.sub);
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto): Promise<boolean> {
    return this.passwordResetService.resetPassword(
      data.token,
      data.newPassword,
    );
  }
}
