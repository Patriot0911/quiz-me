import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LobbyEntity } from '../entities/lobby.entity';
import { LobbyParticipantEntity } from '../entities/lobby-participant.entity';
import { LobbyEventEntity } from '../entities/lobby-event.entity';
import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyRoundState } from '../enums/lobby-round-state.enum';
import { LobbyStatus } from '../enums/lobby-status.enum';
import { ParticipantStatus } from '../enums/participant-status.enum';
import { LobbyEventType } from '../enums/lobby-event-type.enum';
import { LobbyEventLogService } from './lobby-event-log.service';
import {
  IAckResponse,
  ILobbySnapshot,
  IRuntimeLobbyState,
} from '../models/lobby-runtime-state.model';

interface IBuzzResult extends IAckResponse {
  event?: LobbyEventType;
}

@Injectable()
export class LobbyRuntimeService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LobbyRuntimeService.name);
  private readonly lobbies = new Map<string, IRuntimeLobbyState>();
  private readonly codeIndex = new Map<string, string>();

  constructor(
    @InjectRepository(LobbyEntity)
    private readonly lobbyRepository: Repository<LobbyEntity>,
    @InjectRepository(LobbyParticipantEntity)
    private readonly participantRepository: Repository<LobbyParticipantEntity>,
    @InjectRepository(LobbyEventEntity)
    private readonly eventRepository: Repository<LobbyEventEntity>,
    private readonly eventLog: LobbyEventLogService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const openLobbies = await this.lobbyRepository.find({
      where: { status: LobbyStatus.Open },
      relations: ['participants'],
    });

    for (const lobby of openLobbies) {
      const state: IRuntimeLobbyState = {
        lobbyId: lobby.id,
        code: lobby.code,
        hostId: lobby.hostId,
        title: lobby.title,
        mode: lobby.mode,
        timeoutSeconds: lobby.timeoutSeconds,
        status: lobby.status,
        roundState: lobby.roundState,
        lockedBy: null,
        queue: [],
        participants: new Map(),
      };

      for (const participant of lobby.participants) {
        state.participants.set(participant.id, {
          id: participant.id,
          nickname: participant.nickname,
          status: participant.status,
          timeoutUntil: participant.timeoutUntil,
          connected: false,
        });
      }

      if (lobby.lockedByParticipantId) {
        const locked = state.participants.get(lobby.lockedByParticipantId);
        if (locked) {
          state.lockedBy = {
            participantId: locked.id,
            nickname: locked.nickname,
            lockedAt: lobby.roundArmedAt ?? new Date(),
          };
        }
      }

      if (
        lobby.mode === LobbyMode.Queue &&
        lobby.roundState === LobbyRoundState.Armed
      ) {
        state.queue = await this.rebuildQueue(lobby.id);
      }

      this.lobbies.set(lobby.id, state);
      this.codeIndex.set(lobby.code, lobby.id);
    }

    this.logger.log(
      `Hydrated ${openLobbies.length} open lobbies from database`,
    );
  }

  private async rebuildQueue(lobbyId: string) {
    const lastBoundary = await this.eventRepository.findOne({
      where: [
        { lobbyId, type: LobbyEventType.RoundArmed },
        { lobbyId, type: LobbyEventType.RoundReset },
      ],
      order: { createdAt: 'DESC' },
    });

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .where('event.lobbyId = :lobbyId', { lobbyId })
      .andWhere('event.type = :type', { type: LobbyEventType.Buzz })
      .orderBy('event.createdAt', 'ASC');

    if (lastBoundary) {
      qb.andWhere('event.createdAt > :after', {
        after: lastBoundary.createdAt,
      });
    }

    const buzzEvents = await qb.getMany();

    return buzzEvents
      .filter((event) => event.participantId)
      .map((event) => ({
        participantId: event.participantId as string,
        nickname: (event.payload?.nickname as string) ?? '',
        buzzedAt: event.createdAt,
      }));
  }

  registerLobby(lobby: LobbyEntity): void {
    const state: IRuntimeLobbyState = {
      lobbyId: lobby.id,
      code: lobby.code,
      hostId: lobby.hostId,
      title: lobby.title,
      mode: lobby.mode,
      timeoutSeconds: lobby.timeoutSeconds,
      status: lobby.status,
      roundState: lobby.roundState,
      lockedBy: null,
      queue: [],
      participants: new Map(),
    };
    this.lobbies.set(lobby.id, state);
    this.codeIndex.set(lobby.code, lobby.id);
  }

  registerParticipant(
    lobbyId: string,
    participant: LobbyParticipantEntity,
  ): void {
    const state = this.lobbies.get(lobbyId);
    if (!state) return;
    state.participants.set(participant.id, {
      id: participant.id,
      nickname: participant.nickname,
      status: participant.status,
      timeoutUntil: participant.timeoutUntil,
      connected: false,
    });
  }

  getStateByLobbyId(lobbyId: string): IRuntimeLobbyState | undefined {
    return this.lobbies.get(lobbyId);
  }

  getStateByCode(code: string): IRuntimeLobbyState | undefined {
    const lobbyId = this.codeIndex.get(code);
    return lobbyId ? this.lobbies.get(lobbyId) : undefined;
  }

  setParticipantConnected(
    lobbyId: string,
    participantId: string,
    connected: boolean,
  ): void {
    const state = this.lobbies.get(lobbyId);
    const participant = state?.participants.get(participantId);
    if (!participant) return;
    participant.connected = connected;

    this.participantRepository
      .update(participantId, { lastSeenAt: new Date() })
      .catch((error) =>
        this.logger.error('Failed to update participant lastSeenAt', error),
      );

    this.eventLog.log(
      lobbyId,
      connected
        ? LobbyEventType.ParticipantReconnected
        : LobbyEventType.ParticipantDisconnected,
      participantId,
    );
  }

  buildSnapshot(state: IRuntimeLobbyState): ILobbySnapshot {
    return {
      lobby: {
        id: state.lobbyId,
        code: state.code,
        title: state.title,
        mode: state.mode,
        timeoutSeconds: state.timeoutSeconds,
        status: state.status,
        roundState: state.roundState,
      },
      participants: Array.from(state.participants.values()).map((p) => ({
        id: p.id,
        nickname: p.nickname,
        status: p.status,
        timeoutUntil: p.timeoutUntil,
        connected: p.connected,
      })),
      lockedBy: state.lockedBy,
      queue: state.queue,
    };
  }

  updateSettings(
    lobbyId: string,
    changes: { mode?: LobbyMode; timeoutSeconds?: number },
  ): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };
    if (state.roundState !== LobbyRoundState.Idle) {
      return { ok: false, reason: 'round-in-progress' };
    }

    const modeChanged =
      changes.mode !== undefined && changes.mode !== state.mode;
    if (changes.mode !== undefined) state.mode = changes.mode;
    if (changes.timeoutSeconds !== undefined) {
      state.timeoutSeconds = changes.timeoutSeconds;
    }

    this.lobbyRepository
      .update(lobbyId, {
        ...(changes.mode !== undefined ? { mode: changes.mode } : {}),
        ...(changes.timeoutSeconds !== undefined
          ? { timeoutSeconds: changes.timeoutSeconds }
          : {}),
      })
      .catch((error) =>
        this.logger.error('Failed to persist lobby settings', error),
      );

    if (modeChanged) {
      this.eventLog.log(lobbyId, LobbyEventType.ModeChanged, null, {
        mode: changes.mode,
      });
    }

    return { ok: true };
  }

  armRound(lobbyId: string): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    if (state.roundState === LobbyRoundState.Armed) {
      return { ok: false, reason: 'already-armed' };
    }

    if (
      state.roundState === LobbyRoundState.Locked &&
      state.mode !== LobbyMode.FirstLock
    ) {
      return { ok: false, reason: 'cannot-arm-while-locked' };
    }

    state.roundState = LobbyRoundState.Armed;
    state.lockedBy = null;
    if (state.mode === LobbyMode.Queue) {
      state.queue = [];
    }

    this.persistRoundState(lobbyId, state);
    this.eventLog.log(lobbyId, LobbyEventType.RoundArmed);

    return { ok: true };
  }

  resetRound(lobbyId: string): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    state.roundState = LobbyRoundState.Idle;
    state.lockedBy = null;
    state.queue = [];

    this.persistRoundState(lobbyId, state);
    this.eventLog.log(lobbyId, LobbyEventType.RoundReset);

    return { ok: true };
  }

  buzz(lobbyId: string, participantId: string): IBuzzResult {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    const participant = state.participants.get(participantId);
    if (!participant) return { ok: false, reason: 'unknown-participant' };

    if (state.roundState !== LobbyRoundState.Armed) {
      return { ok: false, reason: 'not-armed' };
    }

    if (participant.status === ParticipantStatus.TimedOut) {
      if (
        participant.timeoutUntil &&
        participant.timeoutUntil.getTime() <= Date.now()
      ) {
        participant.status = ParticipantStatus.Active;
        participant.timeoutUntil = null;
      } else {
        return { ok: false, reason: 'timed-out' };
      }
    }

    if (state.mode === LobbyMode.Queue) {
      if (state.queue.some((entry) => entry.participantId === participantId)) {
        return { ok: false, reason: 'already-buzzed' };
      }
      state.queue.push({
        participantId,
        nickname: participant.nickname,
        buzzedAt: new Date(),
      });

      this.eventLog.log(lobbyId, LobbyEventType.Buzz, participantId, {
        nickname: participant.nickname,
      });

      return { ok: true, event: LobbyEventType.Buzz };
    }

    state.roundState = LobbyRoundState.Locked;
    state.lockedBy = {
      participantId,
      nickname: participant.nickname,
      lockedAt: new Date(),
    };

    this.persistRoundState(lobbyId, state);
    this.eventLog.log(lobbyId, LobbyEventType.Buzz, participantId, {
      nickname: participant.nickname,
    });

    return { ok: true, event: LobbyEventType.Buzz };
  }

  judge(lobbyId: string, correct: boolean): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };
    if (state.mode !== LobbyMode.FirstLockJudged) {
      return { ok: false, reason: 'unsupported-for-mode' };
    }
    if (state.roundState !== LobbyRoundState.Locked || !state.lockedBy) {
      return { ok: false, reason: 'not-locked' };
    }

    const { participantId } = state.lockedBy;
    const participant = state.participants.get(participantId);

    if (correct) {
      state.roundState = LobbyRoundState.Idle;
      state.lockedBy = null;
      this.persistRoundState(lobbyId, state);
      this.eventLog.log(lobbyId, LobbyEventType.JudgedCorrect, participantId);
      return { ok: true };
    }

    if (participant) {
      participant.status = ParticipantStatus.TimedOut;
      participant.timeoutUntil = new Date(
        Date.now() + state.timeoutSeconds * 1000,
      );

      this.participantRepository
        .update(participantId, {
          status: ParticipantStatus.TimedOut,
          timeoutUntil: participant.timeoutUntil,
        })
        .catch((error) =>
          this.logger.error('Failed to persist participant timeout', error),
        );
    }

    state.roundState = LobbyRoundState.Armed;
    state.lockedBy = null;

    this.persistRoundState(lobbyId, state);
    this.eventLog.log(lobbyId, LobbyEventType.JudgedIncorrect, participantId);
    this.eventLog.log(lobbyId, LobbyEventType.TimeoutSet, participantId, {
      timeoutUntil: participant?.timeoutUntil,
    });

    return { ok: true };
  }

  resetTimeouts(lobbyId: string): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };
    if (state.mode !== LobbyMode.FirstLockJudged) {
      return { ok: false, reason: 'unsupported-for-mode' };
    }

    const timedOutIds: string[] = [];
    for (const participant of state.participants.values()) {
      if (participant.status === ParticipantStatus.TimedOut) {
        participant.status = ParticipantStatus.Active;
        participant.timeoutUntil = null;
        timedOutIds.push(participant.id);
      }
    }

    if (timedOutIds.length > 0) {
      this.participantRepository
        .update(timedOutIds, {
          status: ParticipantStatus.Active,
          timeoutUntil: null,
        })
        .catch((error) =>
          this.logger.error('Failed to persist timeout reset', error),
        );
    }

    this.eventLog.log(lobbyId, LobbyEventType.TimeoutsReset);

    return { ok: true };
  }

  resetParticipantTimeout(
    lobbyId: string,
    participantId: string,
  ): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    const participant = state.participants.get(participantId);
    if (!participant) return { ok: false, reason: 'unknown-participant' };
    if (participant.status !== ParticipantStatus.TimedOut) {
      return { ok: false, reason: 'not-timed-out' };
    }

    participant.status = ParticipantStatus.Active;
    participant.timeoutUntil = null;

    this.participantRepository
      .update(participantId, {
        status: ParticipantStatus.Active,
        timeoutUntil: null,
      })
      .catch((error) =>
        this.logger.error('Failed to persist participant timeout reset', error),
      );

    this.eventLog.log(
      lobbyId,
      LobbyEventType.ParticipantTimeoutReset,
      participantId,
    );

    return { ok: true };
  }

  renameParticipant(
    lobbyId: string,
    participantId: string,
    nickname: string,
  ): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    const participant = state.participants.get(participantId);
    if (!participant) return { ok: false, reason: 'unknown-participant' };

    const trimmed = nickname.trim();
    if (!trimmed || trimmed.length > 32) {
      return { ok: false, reason: 'invalid-nickname' };
    }

    const isTaken = Array.from(state.participants.values()).some(
      (other) =>
        other.id !== participantId &&
        other.nickname.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isTaken) return { ok: false, reason: 'nickname-taken' };

    const previousNickname = participant.nickname;
    participant.nickname = trimmed;

    if (state.lockedBy?.participantId === participantId) {
      state.lockedBy = { ...state.lockedBy, nickname: trimmed };
    }
    state.queue = state.queue.map((entry) =>
      entry.participantId === participantId
        ? { ...entry, nickname: trimmed }
        : entry,
    );

    this.participantRepository
      .update(participantId, { nickname: trimmed })
      .catch((error) =>
        this.logger.error('Failed to persist participant rename', error),
      );

    this.eventLog.log(
      lobbyId,
      LobbyEventType.ParticipantRenamed,
      participantId,
      {
        from: previousNickname,
        to: trimmed,
      },
    );

    return { ok: true };
  }

  kickParticipant(lobbyId: string, participantId: string): IAckResponse {
    const state = this.lobbies.get(lobbyId);
    if (!state) return { ok: false, reason: 'not-found' };

    const participant = state.participants.get(participantId);
    if (!participant) return { ok: false, reason: 'unknown-participant' };

    state.participants.delete(participantId);
    state.queue = state.queue.filter(
      (entry) => entry.participantId !== participantId,
    );

    if (state.lockedBy?.participantId === participantId) {
      state.lockedBy = null;
      if (state.roundState === LobbyRoundState.Locked) {
        state.roundState = LobbyRoundState.Armed;
      }
      this.persistRoundState(lobbyId, state);
    }

    this.participantRepository
      .delete(participantId)
      .catch((error) =>
        this.logger.error('Failed to delete kicked participant', error),
      );

    this.eventLog.log(
      lobbyId,
      LobbyEventType.ParticipantKicked,
      participantId,
      {
        nickname: participant.nickname,
      },
    );

    return { ok: true };
  }

  sweepExpiredTimeouts(): string[] {
    const now = Date.now();
    const changedLobbyIds: string[] = [];

    for (const [lobbyId, state] of this.lobbies) {
      let changed = false;

      for (const participant of state.participants.values()) {
        if (
          participant.status === ParticipantStatus.TimedOut &&
          participant.timeoutUntil &&
          participant.timeoutUntil.getTime() <= now
        ) {
          participant.status = ParticipantStatus.Active;
          participant.timeoutUntil = null;
          changed = true;

          this.participantRepository
            .update(participant.id, {
              status: ParticipantStatus.Active,
              timeoutUntil: null,
            })
            .catch((error) =>
              this.logger.error(
                'Failed to persist swept participant timeout',
                error,
              ),
            );
        }
      }

      if (changed) changedLobbyIds.push(lobbyId);
    }

    return changedLobbyIds;
  }

  closeLobby(lobbyId: string): void {
    const state = this.lobbies.get(lobbyId);
    if (!state) return;
    state.status = LobbyStatus.Closed;
    this.lobbyRepository
      .update(lobbyId, { status: LobbyStatus.Closed, closedAt: new Date() })
      .catch((error) => this.logger.error('Failed to close lobby', error));
    this.lobbies.delete(lobbyId);
    this.codeIndex.delete(state.code);
  }

  private persistRoundState(lobbyId: string, state: IRuntimeLobbyState): void {
    this.lobbyRepository
      .update(lobbyId, {
        roundState: state.roundState,
        lockedByParticipantId: state.lockedBy?.participantId ?? null,
        roundArmedAt:
          state.roundState === LobbyRoundState.Armed ? new Date() : null,
      })
      .catch((error) =>
        this.logger.error('Failed to persist round state', error),
      );
  }
}
