import { useQuery } from '@tanstack/react-query';
import LobbyService, { LobbyQueryKey } from '@/lib/services/lobby.service';
import { IMyLobby } from '@/interfaces/lobby/lobby';

const useMyLobbiesQuery = () => {
  return useQuery<IMyLobby[], Error>({
    queryKey: [LobbyQueryKey.MyLobbies],
    queryFn: LobbyService.getMyLobbies,
  });
};

export default useMyLobbiesQuery;
