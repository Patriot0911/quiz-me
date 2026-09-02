import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import { LobbyStatus } from '@/enums/lobby-status.enum';
import { ParticipantStatus } from '@/enums/participant-status.enum';

export interface ISnapshotParticipant {
  id: string;
  nickname: string;
  status: ParticipantStatus;
  timeoutUntil: string | null;
  connected: boolean;
};

export interface ISnapshotLockedBy {
  participantId: string;
  nickname: string;
  lockedAt: string;
};

export interface ISnapshotQueueEntry {
  participantId: string;
  nickname: string;
  buzzedAt: string;
};

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
  participants: ISnapshotParticipant[];
  lockedBy: ISnapshotLockedBy | null;
  queue: ISnapshotQueueEntry[];
};

export interface ILobbyEventBroadcast {
  type: string;
  participantId?: string;
  payload?: Record<string, unknown>;
  at: string;
};

export interface IAckResponse {
  ok: boolean;
  reason?: string;
};
