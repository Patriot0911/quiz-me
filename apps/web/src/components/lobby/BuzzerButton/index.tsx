'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import { ParticipantStatus } from '@/enums/participant-status.enum';
import { cn } from '@/lib/cn';

import styles from './styles.module.scss';

const BUZZ_ERROR_MESSAGES: Record<string, string> = {
  'timed-out': 'Таймаут ще триває.',
  'not-armed': 'Раунд ще не почався.',
  'already-buzzed': 'Ви вже натиснули.',
  'cannot-arm-while-locked': 'Кнопку вже заблоковано.',
};

const BuzzerButton = () => {
  const { snapshot, selfParticipantId, buzz, requestSync } = useLobbyRoom();
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
    const msUntilExpiry = Math.max(0, timeoutUntilMs - Date.now());
    const expiry = setTimeout(tick, msUntilExpiry);
    // Fallback in case the server's timeout-expired broadcast is missed (e.g. a
    // backgrounded tab throttling timers): ask the server directly shortly after
    // the deadline. If a real update already resolved the timeout by then, this
    // effect will have re-run and cleanup will have cancelled this timer already.
    const fallback = setTimeout(() => requestSync(), msUntilExpiry + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(expiry);
      clearTimeout(fallback);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    void buzz()
      .then((result) => {
        if (result.ok) return;
        toast.error(BUZZ_ERROR_MESSAGES[result.reason ?? ''] ?? 'Не вдалося натиснути кнопку.');
        if (result.reason === 'timed-out') requestSync();
      })
      .finally(() => setIsBuzzing(false));
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
