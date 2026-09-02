import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LobbyEntity } from './entities/lobby.entity';
import { LobbyParticipantEntity } from './entities/lobby-participant.entity';
import { LobbyEventEntity } from './entities/lobby-event.entity';
import { LobbyController } from './controllers/lobby.controller';
import { LobbyGateway } from './gateways/lobby.gateway';
import { LobbyService } from './services/lobby.service';
import { LobbyRuntimeService } from './services/lobby-runtime.service';
import { ParticipantTokenService } from './services/participant-token.service';
import { LobbyEventLogService } from './services/lobby-event-log.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LobbyEntity,
      LobbyParticipantEntity,
      LobbyEventEntity,
    ]),
    JwtModule.register({}),
  ],
  controllers: [LobbyController],
  providers: [
    LobbyService,
    LobbyRuntimeService,
    ParticipantTokenService,
    LobbyEventLogService,
    LobbyGateway,
  ],
})
export class LobbyModule {}
