import { useMutation } from '@tanstack/react-query';
import LobbyService from '@/lib/services/lobby.service';
import { IJoinLobbyPayload, IJoinLobbyResponse } from '@/interfaces/lobby/lobby';

interface IJoinLobbyVariables extends IJoinLobbyPayload {
  code: string;
}

const useJoinLobbyMutation = () => {
  return useMutation<IJoinLobbyResponse, Error, IJoinLobbyVariables>({
    mutationFn: ({ code, ...payload }) => LobbyService.joinLobby(code, payload),
  });
};

export default useJoinLobbyMutation;
