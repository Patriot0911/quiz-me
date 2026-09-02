import { createContext, useContext } from 'react';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { IAckResponse, ILobbySnapshot } from '@/interfaces/lobby/snapshot';

export type TLobbyConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface ILobbyRoomContextValue {
  connectionStatus: TLobbyConnectionStatus;
  snapshot: ILobbySnapshot | null;
  errorMessage: string | null;
  role: 'host' | 'participant';
  selfParticipantId?: string;
  armRound: () => Promise<IAckResponse>;
  resetRound: () => Promise<IAckResponse>;
  judge: (correct: boolean) => Promise<IAckResponse>;
  resetTimeouts: () => Promise<IAckResponse>;
  updateSettings: (changes: { mode?: LobbyMode; timeoutSeconds?: number }) => Promise<IAckResponse>;
  buzz: () => Promise<IAckResponse>;
}

export const LobbyRoomContext = createContext<ILobbyRoomContextValue | null>(null);

export const useLobbyRoom = (): ILobbyRoomContextValue => {
  const ctx = useContext(LobbyRoomContext);
  if (!ctx) {
    throw new Error('useLobbyRoom must be used within a LobbyRoomProvider');
  }
  return ctx;
};
