import { useQuery } from '@tanstack/react-query';
import LobbyService, { LobbyQueryKey } from '@/lib/services/lobby.service';
import { IPublicLobby } from '@/interfaces/lobby/lobby';

const useLobbyByCodeQuery = (code: string) => {
  return useQuery<IPublicLobby, Error>({
    queryKey: [LobbyQueryKey.LobbyByCode, code],
    queryFn: () => LobbyService.getLobbyByCode(code),
    retry: false,
    enabled: Boolean(code),
  });
};

export default useLobbyByCodeQuery;
