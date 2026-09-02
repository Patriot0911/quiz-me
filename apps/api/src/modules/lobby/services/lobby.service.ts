import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { LobbyEntity } from '../entities/lobby.entity';
import { LobbyParticipantEntity } from '../entities/lobby-participant.entity';
import { CreateLobbyDto } from '../dto/create-lobby.dto';
import { JoinLobbyDto } from '../dto/join-lobby.dto';
import { LobbyResponseDto } from '../dto/lobby-response.dto';
import { PublicLobbyDto } from '../dto/public-lobby.dto';
import { JoinLobbyResponseDto } from '../dto/join-lobby-response.dto';
import { MyLobbyDto } from '../dto/my-lobby.dto';
import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyStatus } from '../enums/lobby-status.enum';
import { LobbyEventType } from '../enums/lobby-event-type.enum';
import { LobbyRuntimeService } from './lobby-runtime.service';
import { ParticipantTokenService } from './participant-token.service';
import { LobbyEventLogService } from './lobby-event-log.service';
import { LobbyGateway } from '../gateways/lobby.gateway';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

@Injectable()
export class LobbyService {
  constructor(
    @InjectRepository(LobbyEntity)
    private readonly lobbyRepository: Repository<LobbyEntity>,
    @InjectRepository(LobbyParticipantEntity)
    private readonly participantRepository: Repository<LobbyParticipantEntity>,
    private readonly runtime: LobbyRuntimeService,
    private readonly participantTokenService: ParticipantTokenService,
    private readonly eventLog: LobbyEventLogService,
    private readonly gateway: LobbyGateway,
  ) {}

  async createLobby(
    hostId: string,
    dto: CreateLobbyDto,
  ): Promise<LobbyResponseDto> {
    const code = await this.generateUniqueCode();

    const lobby = await this.lobbyRepository.save(
      this.lobbyRepository.create({
        code,
        hostId,
        title: dto.title,
        mode: dto.mode ?? LobbyMode.FirstLock,
        timeoutSeconds: dto.timeoutSeconds ?? 15,
      }),
    );

    this.runtime.registerLobby(lobby);

    return {
      id: lobby.id,
      code: lobby.code,
      title: lobby.title,
      mode: lobby.mode,
      timeoutSeconds: lobby.timeoutSeconds,
      status: lobby.status,
    };
  }

  async getMyLobbies(hostId: string): Promise<MyLobbyDto[]> {
    const lobbies = await this.lobbyRepository.find({
      where: { hostId },
      relations: ['participants'],
      order: { createdAt: 'DESC' },
    });

    return lobbies.map((lobby) => ({
      id: lobby.id,
      code: lobby.code,
      title: lobby.title,
      mode: lobby.mode,
      timeoutSeconds: lobby.timeoutSeconds,
      status: lobby.status,
      createdAt: lobby.createdAt,
      participantCount: lobby.participants.length,
    }));
  }

  async getPublicLobby(code: string): Promise<PublicLobbyDto> {
    const lobby = await this.lobbyRepository.findOne({ where: { code } });
    if (!lobby) throw new NotFoundException('Lobby not found');

    return {
      code: lobby.code,
      title: lobby.title,
      mode: lobby.mode,
      status: lobby.status,
    };
  }

  async joinLobby(
    code: string,
    dto: JoinLobbyDto,
  ): Promise<JoinLobbyResponseDto> {
    const lobby = await this.lobbyRepository.findOne({ where: { code } });
    if (!lobby || lobby.status !== LobbyStatus.Open) {
      throw new NotFoundException('Lobby not found');
    }

    const existing = await this.participantRepository.findOne({
      where: { lobbyId: lobby.id, nickname: ILike(dto.nickname) },
    });

    let participant: LobbyParticipantEntity;

    if (existing) {
      const runtimeState = this.runtime.getStateByLobbyId(lobby.id);
      const isConnected =
        runtimeState?.participants.get(existing.id)?.connected ?? false;
      if (isConnected) {
        throw new ConflictException('Nickname already taken in this lobby');
      }

      participant = existing;
      if (!runtimeState) {
        this.runtime.registerLobby(lobby);
      }
      if (!this.runtime.getStateByLobbyId(lobby.id)!.participants.has(existing.id)) {
        this.runtime.registerParticipant(lobby.id, existing);
      }

      this.eventLog.log(
        lobby.id,
        LobbyEventType.ParticipantReconnected,
        participant.id,
        { nickname: participant.nickname },
      );
    } else {
      participant = await this.participantRepository.save(
        this.participantRepository.create({
          lobbyId: lobby.id,
          nickname: dto.nickname,
        }),
      );

      if (!this.runtime.getStateByLobbyId(lobby.id)) {
        this.runtime.registerLobby(lobby);
      }
      this.runtime.registerParticipant(lobby.id, participant);
      this.eventLog.log(
        lobby.id,
        LobbyEventType.ParticipantJoined,
        participant.id,
        { nickname: participant.nickname },
      );
    }

    const participantToken = await this.participantTokenService.sign(
      lobby.id,
      participant.id,
    );

    return {
      lobbyId: lobby.id,
      code: lobby.code,
      participantId: participant.id,
      nickname: participant.nickname,
      participantToken,
    };
  }

  async closeLobbyAsHost(code: string, hostId: string): Promise<void> {
    const lobby = await this.lobbyRepository.findOne({ where: { code } });
    if (!lobby) throw new NotFoundException('Lobby not found');
    if (lobby.hostId !== hostId) {
      throw new ForbiddenException('Not your lobby');
    }
    if (lobby.status === LobbyStatus.Closed) {
      throw new ConflictException('Lobby already closed');
    }

    this.runtime.closeLobby(lobby.id);
    this.gateway.notifyLobbyClosed(lobby.id);
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = this.generateCode();
      const exists = await this.lobbyRepository.findOne({ where: { code } });
      if (!exists) return code;
    }
    throw new ConflictException('Failed to generate a unique lobby code');
  }

  private generateCode(): string {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    return code;
  }
}
