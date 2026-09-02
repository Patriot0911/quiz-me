'use client';

import { useEffect, useState } from 'react';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import { ParticipantStatus } from '@/enums/participant-status.enum';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const BuzzerButton = () => {
  const { snapshot, selfParticipantId, buzz } = useLobbyRoom();
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const self = snapshot?.participants.find((p) => p.id === selfParticipantId);
  const timeoutUntilMs = self?.timeoutUntil ? new Date(self.timeoutUntil).getTime() : null;
  const remainingSeconds =
    timeoutUntilMs !== null ? Math.max(0, Math.ceil((timeoutUntilMs - now) / 1000)) : 0;
  const isTimedOut = self?.status === ParticipantStatus.TIMED_OUT && remainingSeconds > 0;

  useEffect(() => {
    if (!isTimedOut) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isTimedOut]);

  const alreadyInQueue = snapshot?.queue.some(
    (entry) => entry.participantId === selfParticipantId,
  ) ?? false;
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
    if (isTimedOut) return `Таймаут: ${remainingSeconds}с`;
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
