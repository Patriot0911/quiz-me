'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LobbyRoundState } from '@/enums/lobby-round-state.enum';
import Button from '@/components/ui/Button';

import styles from './styles.module.scss';

const HostJudgeControls = () => {
  const { snapshot, judge } = useLobbyRoom();
  const [isJudging, setIsJudging] = useState(false);

  if (!snapshot) return null;
  const { mode, roundState } = snapshot.lobby;
  if (mode !== LobbyMode.FIRST_LOCK_JUDGED || roundState !== LobbyRoundState.LOCKED) {
    return null;
  }

  const handleJudge = async (correct: boolean) => {
    setIsJudging(true);
    const result = await judge(correct);
    setIsJudging(false);
    if (!result.ok) toast.error('Не вдалося зафіксувати рішення');
  };

  return (
    <div className={styles.wrapper}>
      <p className={styles.answering}>
        Відповідає: <strong>{snapshot.lockedBy?.nickname}</strong>
      </p>
      <div className={styles.actions}>
        <Button variant="success" onClick={() => void handleJudge(true)} isLoading={isJudging}>
          Правильно
        </Button>
        <Button variant="danger" onClick={() => void handleJudge(false)} isLoading={isJudging}>
          Неправильно
        </Button>
      </div>
    </div>
  );
};

export default HostJudgeControls;
