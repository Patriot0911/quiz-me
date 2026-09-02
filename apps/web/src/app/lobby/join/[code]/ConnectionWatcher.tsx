'use client';

import { useEffect } from 'react';
import { useLobbyRoom } from '@/components/lobby/LobbyRoomProvider/context';

interface IConnectionWatcherProps {
  onError: () => void;
}

const ConnectionWatcher = ({ onError }: IConnectionWatcherProps) => {
  const { connectionStatus } = useLobbyRoom();

  useEffect(() => {
    if (connectionStatus === 'error') onError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus]);

  return null;
};

export default ConnectionWatcher;
