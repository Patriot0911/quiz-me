'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '@/components/lobby/LobbyRoomProvider/context';

interface IConnectionWatcherProps {
  onError: () => void;
}

const ConnectionWatcher = ({ onError }: IConnectionWatcherProps) => {
  const { connectionStatus, wasKicked, wasClosed } = useLobbyRoom();

  useEffect(() => {
    if (connectionStatus === 'error') onError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus]);

  useEffect(() => {
    if (!wasKicked) return;
    toast.error('Хост видалив вас із лобі');
    onError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasKicked]);

  useEffect(() => {
    if (!wasClosed) return;
    toast.error('Хост закрив лобі');
    onError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wasClosed]);

  return null;
};

export default ConnectionWatcher;
