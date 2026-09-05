import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnModuleDestroy } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { TokenType } from 'src/modules/auth/models/token-type.enum';
import type { IAccessTokenPayload } from 'src/modules/auth/models/access-token-payload.model';
import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyEventType } from '../enums/lobby-event-type.enum';
import type {
  IAckResponse,
  ILobbySocketData,
} from '../models/lobby-runtime-state.model';
import { LobbyRuntimeService } from '../services/lobby-runtime.service';
import { ParticipantTokenService } from '../services/participant-token.service';

type LobbySocket = Socket<any, any, any, ILobbySocketData>;

@WebSocketGateway({
  namespace: '/lobby',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class LobbyGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LobbyGateway.name);
  private timeoutSweepInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly runtime: LobbyRuntimeService,
    private readonly participantTokenService: ParticipantTokenService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server): void {
    server.use((socket: LobbySocket, next: (err?: Error) => void) => {
      this.authenticate(socket)
        .then(() => next())
        .catch(() => next(new Error('unauthorized')));
    });

    this.timeoutSweepInterval = setInterval(() => {
      const expired = this.runtime.sweepExpiredTimeouts();
      const changedLobbyIds = new Set(expired.map((entry) => entry.lobbyId));
      changedLobbyIds.forEach((lobbyId) => this.broadcastSnapshot(lobbyId));
      expired.forEach(({ lobbyId, participantId }) =>
        this.broadcastEvent(
          lobbyId,
          LobbyEventType.TimeoutExpired,
          participantId,
        ),
      );
    }, 1000);
  }

  onModuleDestroy(): void {
    if (this.timeoutSweepInterval) {
      clearInterval(this.timeoutSweepInterval);
      this.timeoutSweepInterval = null;
    }
  }

  private async authenticate(socket: LobbySocket): Promise<void> {
    const { token, participantToken, code } = socket.handshake.auth as {
      token?: string;
      participantToken?: string;
      code?: string;
    };

    if (token) {
      const payload = await this.jwtService.verifyAsync<IAccessTokenPayload>(
        token,
        { secret: this.configService.get('auth.jwt.secret.access') },
      );
      if (payload.use !== TokenType.Access) {
        throw new Error('invalid token');
      }
      if (!code) throw new Error('lobby code required');

      const state = this.runtime.getStateByCode(code);
      if (!state) throw new Error('lobby not found');
      if (state.hostId !== payload.sub) throw new Error('forbidden');

      socket.data.role = 'host';
      socket.data.userId = payload.sub;
      socket.data.lobbyId = state.lobbyId;
      return;
    }

    if (participantToken) {
      const payload =
        await this.participantTokenService.verify(participantToken);
      const state = this.runtime.getStateByLobbyId(payload.lobbyId);
      if (!state) throw new Error('lobby not found');
      if (!state.participants.has(payload.participantId)) {
        throw new Error('unknown participant');
      }

      socket.data.role = 'participant';
      socket.data.participantId = payload.participantId;
      socket.data.lobbyId = payload.lobbyId;
      return;
    }

    throw new Error('unauthorized');
  }

  handleConnection(socket: LobbySocket): void {
    const lobbyId = socket.data.lobbyId;
    const state = lobbyId ? this.runtime.getStateByLobbyId(lobbyId) : undefined;
    if (!lobbyId || !state) {
      socket.disconnect(true);
      return;
    }

    void socket.join(this.room(lobbyId));

    if (socket.data.role === 'participant') {
      this.runtime.setParticipantConnected(
        lobbyId,
        socket.data.participantId as string,
        true,
      );
    }

    socket.emit('lobby:snapshot', this.runtime.buildSnapshot(state));
    this.broadcastSnapshot(lobbyId);
  }

  handleDisconnect(socket: LobbySocket): void {
    const lobbyId = socket.data.lobbyId;
    if (!lobbyId) return;

    if (socket.data.role === 'participant') {
      this.runtime.setParticipantConnected(
        lobbyId,
        socket.data.participantId as string,
        false,
      );
      this.broadcastSnapshot(lobbyId);
    }
  }

  @SubscribeMessage('lobby:requestSnapshot')
  handleRequestSnapshot(@ConnectedSocket() socket: LobbySocket) {
    const state = this.runtime.getStateByLobbyId(socket.data.lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };
    return { ok: true, snapshot: this.runtime.buildSnapshot(state) };
  }

  @SubscribeMessage('participant:buzz')
  handleBuzz(@ConnectedSocket() socket: LobbySocket): IAckResponse {
    if (socket.data.role !== 'participant') {
      return { ok: false, reason: 'forbidden' };
    }
    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.buzz(
      lobbyId,
      socket.data.participantId as string,
    );
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(
        lobbyId,
        LobbyEventType.Buzz,
        socket.data.participantId,
      );
    }
    return result;
  }

  @SubscribeMessage('host:armRound')
  handleArmRound(@ConnectedSocket() socket: LobbySocket): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.armRound(lobbyId);
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(lobbyId, LobbyEventType.RoundArmed);
    }
    return result;
  }

  @SubscribeMessage('host:resetRound')
  handleResetRound(@ConnectedSocket() socket: LobbySocket): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.resetRound(lobbyId);
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(lobbyId, LobbyEventType.RoundReset);
    }
    return result;
  }

  @SubscribeMessage('host:judge')
  handleJudge(
    @ConnectedSocket() socket: LobbySocket,
    @MessageBody() data: { correct?: boolean },
  ): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    const lobbyId = socket.data.lobbyId;
    const correct = Boolean(data?.correct);
    const result = this.runtime.judge(lobbyId, correct);
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(
        lobbyId,
        correct ? LobbyEventType.JudgedCorrect : LobbyEventType.JudgedIncorrect,
      );
    }
    return result;
  }

  @SubscribeMessage('host:resetTimeouts')
  handleResetTimeouts(@ConnectedSocket() socket: LobbySocket): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.resetTimeouts(lobbyId);
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(lobbyId, LobbyEventType.TimeoutsReset);
    }
    return result;
  }

  @SubscribeMessage('host:updateSettings')
  handleUpdateSettings(
    @ConnectedSocket() socket: LobbySocket,
    @MessageBody() data: { mode?: LobbyMode; timeoutSeconds?: number },
  ): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.updateSettings(lobbyId, data ?? {});
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
    }
    return result;
  }

  @SubscribeMessage('host:resetParticipantTimeout')
  handleResetParticipantTimeout(
    @ConnectedSocket() socket: LobbySocket,
    @MessageBody() data: { participantId?: string },
  ): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    if (!data?.participantId) return { ok: false, reason: 'invalid-payload' };

    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.resetParticipantTimeout(
      lobbyId,
      data.participantId,
    );
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(
        lobbyId,
        LobbyEventType.ParticipantTimeoutReset,
        data.participantId,
      );
    }
    return result;
  }

  @SubscribeMessage('host:renameParticipant')
  handleRenameParticipant(
    @ConnectedSocket() socket: LobbySocket,
    @MessageBody() data: { participantId?: string; nickname?: string },
  ): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    if (!data?.participantId || !data.nickname) {
      return { ok: false, reason: 'invalid-payload' };
    }

    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.renameParticipant(
      lobbyId,
      data.participantId,
      data.nickname,
    );
    if (result.ok) {
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(
        lobbyId,
        LobbyEventType.ParticipantRenamed,
        data.participantId,
      );
    }
    return result;
  }

  @SubscribeMessage('host:kickParticipant')
  handleKickParticipant(
    @ConnectedSocket() socket: LobbySocket,
    @MessageBody() data: { participantId?: string },
  ): IAckResponse {
    if (socket.data.role !== 'host') return { ok: false, reason: 'forbidden' };
    if (!data?.participantId) return { ok: false, reason: 'invalid-payload' };

    const lobbyId = socket.data.lobbyId;
    const result = this.runtime.kickParticipant(lobbyId, data.participantId);
    if (result.ok) {
      this.disconnectParticipant(lobbyId, data.participantId);
      this.broadcastSnapshot(lobbyId);
      this.broadcastEvent(
        lobbyId,
        LobbyEventType.ParticipantKicked,
        data.participantId,
      );
    }
    return result;
  }

  notifyLobbyClosed(lobbyId: string): void {
    this.server.to(this.room(lobbyId)).emit('lobby:closed');
    for (const target of this.server.sockets.sockets.values()) {
      const data = (target as LobbySocket).data;
      if (data.lobbyId === lobbyId) {
        target.disconnect(true);
      }
    }
  }

  private disconnectParticipant(lobbyId: string, participantId: string): void {
    for (const target of this.server.sockets.sockets.values()) {
      const data = (target as LobbySocket).data;
      if (
        data.role === 'participant' &&
        data.lobbyId === lobbyId &&
        data.participantId === participantId
      ) {
        target.emit('lobby:kicked');
        target.disconnect(true);
      }
    }
  }

  private broadcastSnapshot(lobbyId: string): void {
    const state = this.runtime.getStateByLobbyId(lobbyId);
    if (!state) return;
    this.server
      .to(this.room(lobbyId))
      .emit('lobby:snapshot', this.runtime.buildSnapshot(state));
  }

  private broadcastEvent(
    lobbyId: string,
    type: LobbyEventType,
    participantId?: string,
  ): void {
    this.server.to(this.room(lobbyId)).emit('lobby:event', {
      type,
      participantId,
      at: new Date(),
    });
  }

  private room(lobbyId: string): string {
    return `lobby:${lobbyId}`;
  }
}
