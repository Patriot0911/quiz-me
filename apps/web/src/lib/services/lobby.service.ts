import type {
  ICreateLobbyPayload,
  IJoinLobbyPayload,
  IJoinLobbyResponse,
  ILobby,
  IMyLobby,
  IPublicLobby,
} from '@/interfaces/lobby/lobby';
import { apiClient } from '../axios';

export enum LobbyQueryKey {
  LobbyByCode = 'lobby-by-code',
  MyLobbies = 'my-lobbies',
}

class LobbyService {
  static async createLobby(payload: ICreateLobbyPayload): Promise<ILobby> {
    return apiClient.post('/lobby', payload);
  }

  static async getMyLobbies(): Promise<IMyLobby[]> {
    return apiClient.get('/lobby/mine');
  }

  static async getLobbyByCode(code: string): Promise<IPublicLobby> {
    return apiClient.get(`/lobby/${code}`);
  }

  static async joinLobby(
    code: string,
    payload: IJoinLobbyPayload,
  ): Promise<IJoinLobbyResponse> {
    return apiClient.post(`/lobby/${code}/join`, payload);
  }
}

export default LobbyService;
