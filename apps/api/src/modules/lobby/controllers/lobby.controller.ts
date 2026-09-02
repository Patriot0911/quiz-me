import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard } from 'src/modules/auth/guards/jwt-access.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';
import type { IAccessTokenPayload } from 'src/modules/auth/models/access-token-payload.model';
import { ApiGenericResponses } from 'src/shared/factories/api-generic-responses.factory';
import { CreateLobbyDto } from '../dto/create-lobby.dto';
import { JoinLobbyDto } from '../dto/join-lobby.dto';
import { LobbyResponseDto } from '../dto/lobby-response.dto';
import { PublicLobbyDto } from '../dto/public-lobby.dto';
import { JoinLobbyResponseDto } from '../dto/join-lobby-response.dto';
import { LobbyService } from '../services/lobby.service';

@ApiTags('Lobby')
@Controller('api/lobby')
export class LobbyController {
  constructor(private readonly lobbyService: LobbyService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAccessGuard)
  @ApiGenericResponses({ [HttpStatus.CREATED]: LobbyResponseDto })
  async create(
    @CurrentUser() user: IAccessTokenPayload,
    @Body() dto: CreateLobbyDto,
  ): Promise<LobbyResponseDto> {
    return this.lobbyService.createLobby(user.sub, dto);
  }

  @Get(':code')
  @ApiGenericResponses({ [HttpStatus.OK]: PublicLobbyDto })
  async getByCode(@Param('code') code: string): Promise<PublicLobbyDto> {
    return this.lobbyService.getPublicLobby(code);
  }

  @Post(':code/join')
  @ApiGenericResponses({ [HttpStatus.CREATED]: JoinLobbyResponseDto })
  async join(
    @Param('code') code: string,
    @Body() dto: JoinLobbyDto,
  ): Promise<JoinLobbyResponseDto> {
    return this.lobbyService.joinLobby(code, dto);
  }
}
