import { useMutation } from '@tanstack/react-query';
import LobbyService from '@/lib/services/lobby.service';
import { ICreateLobbyPayload, ILobby } from '@/interfaces/lobby/lobby';

const useCreateLobbyMutation = () => {
  return useMutation<ILobby, Error, ICreateLobbyPayload>({
    mutationFn: LobbyService.createLobby,
  });
};

export default useCreateLobbyMutation;
