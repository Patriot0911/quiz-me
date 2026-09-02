import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LobbyStatus } from '@/enums/lobby-status.enum';

export interface ILobby {
  id: string;
  code: string;
  title: string;
  mode: LobbyMode;
  timeoutSeconds: number;
  status: LobbyStatus;
};

export interface IPublicLobby {
  code: string;
  title: string;
  mode: LobbyMode;
  status: LobbyStatus;
};

export interface ICreateLobbyPayload {
  title: string;
  mode?: LobbyMode;
  timeoutSeconds?: number;
};

export interface IJoinLobbyPayload {
  nickname: string;
};

export interface IJoinLobbyResponse {
  lobbyId: string;
  code: string;
  participantId: string;
  nickname: string;
  participantToken: string;
};

export interface IMyLobby {
  id: string;
  code: string;
  title: string;
  mode: LobbyMode;
  timeoutSeconds: number;
  status: LobbyStatus;
  createdAt: string;
  participantCount: number;
};
