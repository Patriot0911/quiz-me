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

  const self = snapshot?.participants.find((p) => p.id === selfParticipantId);
  const timeoutUntilMs = self?.timeoutUntil ? new Date(self.timeoutUntil).getTime() : null;
  const isTimedOutByServer = self?.status === ParticipantStatus.TIMED_OUT;

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!isTimedOutByServer || timeoutUntilMs === null) {
      setRemainingSeconds(0);
      return undefined;
    }

    const tick = () => {
      setRemainingSeconds(Math.max(0, Math.ceil((timeoutUntilMs - Date.now()) / 1000)));
    };
    tick();

    // ticks the visible countdown every second
    const interval = setInterval(tick, 1000);
    // fires exactly once, at the real deadline, so the button unlocks on time
    // regardless of the 1s interval's alignment
    const expiry = setTimeout(tick, Math.max(0, timeoutUntilMs - Date.now()));

    return () => {
      clearInterval(interval);
      clearTimeout(expiry);
    };
  }, [isTimedOutByServer, timeoutUntilMs]);

  const isTimedOut = isTimedOutByServer && remainingSeconds > 0;

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
