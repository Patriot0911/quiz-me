'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import Button from '@/components/ui/Button';

const HostTimeoutControls = () => {
  const { snapshot, resetTimeouts } = useLobbyRoom();
  const [isResetting, setIsResetting] = useState(false);

  if (!snapshot || snapshot.lobby.mode !== LobbyMode.FIRST_LOCK_JUDGED) return null;

  const handleReset = async () => {
    setIsResetting(true);
    const result = await resetTimeouts();
    setIsResetting(false);
    if (!result.ok) toast.error('Не вдалося скинути таймаути');
  };

  return (
    <Button variant="secondary" onClick={() => void handleReset()} isLoading={isResetting}>
      Скинути всі таймаути
    </Button>
  );
};

export default HostTimeoutControls;
