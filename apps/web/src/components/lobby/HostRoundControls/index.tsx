'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import Button from '@/components/ui/Button';

import styles from './styles.module.scss';

const HostRoundControls = () => {
  const { snapshot, armRound, resetRound } = useLobbyRoom();
  const [isArming, setIsArming] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!snapshot) return null;

  const { roundState, mode } = snapshot.lobby;

  const handleArm = async () => {
    setIsArming(true);
    const result = await armRound();
    setIsArming(false);
    if (!result.ok) toast.error('Не вдалося запустити раунд');
  };

  const handleReset = async () => {
    setIsResetting(true);
    const result = await resetRound();
    setIsResetting(false);
    if (!result.ok) toast.error('Не вдалося скинути раунд');
  };

  const canArm =
    roundState === LobbyRoundState.IDLE ||
    (roundState === LobbyRoundState.LOCKED && mode === LobbyMode.FIRST_LOCK);

  const armLabel =
    roundState === LobbyRoundState.LOCKED ? 'Продовжити' : 'Старт (озброїти кнопки)';

  return (
    <div className={styles.wrapper}>
      <Button onClick={() => void handleArm()} disabled={!canArm} isLoading={isArming}>
        {armLabel}
      </Button>
      <Button
        variant="secondary"
        onClick={() => void handleReset()}
        isLoading={isResetting}
      >
        Скинути раунд (фальшстарт)
      </Button>
    </div>
  );
};

export default HostRoundControls;
