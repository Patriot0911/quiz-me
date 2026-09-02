'use client';

import { useState } from 'react';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import { ParticipantStatus } from '@/enums/participant-status.enum';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const BuzzerButton = () => {
  const { snapshot, selfParticipantId, buzz } = useLobbyRoom();
  const [isBuzzing, setIsBuzzing] = useState(false);

  const self = snapshot?.participants.find((p) => p.id === selfParticipantId);
  const alreadyInQueue = snapshot?.queue.some(
    (entry) => entry.participantId === selfParticipantId,
  ) ?? false;
  const isTimedOut = self?.status === ParticipantStatus.TIMED_OUT;
  const isArmed = snapshot?.lobby.roundState === LobbyRoundState.ARMED;
  const isLocked = snapshot?.lobby.roundState === LobbyRoundState.LOCKED;
  const isLockedByMe = snapshot?.lockedBy?.participantId === selfParticipantId;

  const disabled = !isArmed || isTimedOut || alreadyInQueue || isBuzzing;

  const handleClick = () => {
    if (disabled) return;
    setIsBuzzing(true);
    void buzz().finally(() => setIsBuzzing(false));
  };

  const label = () => {
    if (isTimedOut) return 'Таймаут';
    if (isLocked) return isLockedByMe ? 'Ви перші!' : 'Заблоковано';
    if (alreadyInQueue) return 'Натиснуто';
    if (!isArmed) return 'Очікуйте старту';
    return 'ТИСНИ!';
  };

  return (
    <button
      type="button"
      className={cn(
        styles.buzzer,
        disabled && styles.disabled,
        isLockedByMe && styles.winner,
      )}
      disabled={disabled}
      onClick={handleClick}
    >
      {label()}
    </button>
  );
};

export default BuzzerButton;
