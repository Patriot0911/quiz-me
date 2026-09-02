import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyRoundState } from '../enums/lobby-round-state.enum';
import { LobbyStatus } from '../enums/lobby-status.enum';
import { ParticipantStatus } from '../enums/participant-status.enum';

export interface IRuntimeParticipant {
  id: string;
  nickname: string;
  status: ParticipantStatus;
  timeoutUntil: Date | null;
  connected: boolean;
}

export interface IRuntimeLockedBy {
  participantId: string;
  nickname: string;
  lockedAt: Date;
}

export interface IRuntimeQueueEntry {
  participantId: string;
  nickname: string;
  buzzedAt: Date;
}

export interface IRuntimeLobbyState {
  lobbyId: string;
  code: string;
  hostId: string;
  title: string;
  mode: LobbyMode;
  timeoutSeconds: number;
  status: LobbyStatus;
  roundState: LobbyRoundState;
  lockedBy: IRuntimeLockedBy | null;
  queue: IRuntimeQueueEntry[];
  participants: Map<string, IRuntimeParticipant>;
}

export interface ILobbySnapshot {
  lobby: {
    id: string;
    code: string;
    title: string;
    mode: LobbyMode;
    timeoutSeconds: number;
    status: LobbyStatus;
    roundState: LobbyRoundState;
  };
  participants: Array<{
    id: string;
    nickname: string;
    status: ParticipantStatus;
    timeoutUntil: Date | null;
    connected: boolean;
  }>;
  lockedBy: IRuntimeLockedBy | null;
  queue: IRuntimeQueueEntry[];
}

export interface ILobbyEventBroadcast {
  type: string;
  participantId?: string;
  payload?: Record<string, unknown>;
  at: Date;
}

export interface IAckResponse {
  ok: boolean;
  reason?: string;
}

export interface ILobbySocketData {
  role: 'host' | 'participant';
  userId?: string;
  participantId?: string;
  lobbyId: string;
}
