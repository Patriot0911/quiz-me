import { useMutation, useQueryClient } from '@tanstack/react-query';
import LobbyService, { LobbyQueryKey } from '@/lib/services/lobby.service';

const useCloseLobbyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (code) => LobbyService.closeLobby(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [LobbyQueryKey.MyLobbies] });
      queryClient.invalidateQueries({ queryKey: [LobbyQueryKey.LobbyByCode] });
    },
  });
};

export default useCloseLobbyMutation;
