'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import BaseLayout from '@/components/layout/BaseLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LobbyRoomProvider from '@/components/lobby/LobbyRoomProvider';
import ParticipantBuzzerView from '@/components/lobby/ParticipantBuzzerView';
import useLobbyByCodeQuery from '@/hooks/queries/lobby/useLobbyByCodeQuery';
import useJoinLobbyMutation from '@/hooks/mutations/lobby/useJoinLobbyMutation';
import { LobbyStatus } from '@/enums/lobby-status.enum';
import {
  clearStoredParticipant,
  getStoredParticipant,
  IStoredLobbyParticipant,
  setStoredParticipant,
} from '@/lib/lobbyParticipantStorage';
import ConnectionWatcher from './ConnectionWatcher';

import styles from './styles.module.scss';

const JoinLobbyPage = () => {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? '').toUpperCase();

  const lobbyQuery = useLobbyByCodeQuery(code);
  const joinMutation = useJoinLobbyMutation();

  const [nickname, setNickname] = useState('');
  const [participant, setParticipant] = useState<IStoredLobbyParticipant | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only store after hydration
    setParticipant(getStoredParticipant(code));
  }, [code]);

  const handleJoin = () => {
    const trimmed = nickname.trim();
    if (!trimmed) return;

    joinMutation.mutate(
      { code, nickname: trimmed },
      {
        onSuccess: (data) => {
          const stored: IStoredLobbyParticipant = {
            participantId: data.participantId,
            nickname: data.nickname,
            participantToken: data.participantToken,
          };
          setStoredParticipant(code, stored);
          setParticipant(stored);
        },
        onError: (error) => {
          toast.error(error.message || 'Не вдалося приєднатись до лобі');
        },
      },
    );
  };

  const handleConnectionError = () => {
    clearStoredParticipant(code);
    setParticipant(null);
  };

  if (lobbyQuery.isLoading) {
    return (
      <BaseLayout>
        <p className={styles.status}>Завантаження лобі...</p>
      </BaseLayout>
    );
  }

  if (lobbyQuery.isError || !lobbyQuery.data) {
    return (
      <BaseLayout>
        <p className={styles.status}>Лобі не знайдено</p>
      </BaseLayout>
    );
  }

  if (lobbyQuery.data.status === LobbyStatus.CLOSED) {
    return (
      <BaseLayout>
        <p className={styles.status}>Це лобі вже закрито</p>
      </BaseLayout>
    );
  }

  if (participant) {
    return (
      <BaseLayout>
        <LobbyRoomProvider
          key={participant.participantToken}
          role="participant"
          selfParticipantId={participant.participantId}
          auth={{ participantToken: participant.participantToken }}
        >
          <ConnectionWatcher onError={handleConnectionError} />
          <ParticipantBuzzerView nickname={participant.nickname} />
        </LobbyRoomProvider>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className={styles.wrapper}>
        <h1 className={styles.title}>{lobbyQuery.data.title}</h1>
        <Input
          label="Ваш нікнейм"
          value={nickname}
          maxLength={32}
          onChange={(event) => setNickname(event.target.value)}
        />
        <Button
          onClick={handleJoin}
          disabled={!nickname.trim()}
          isLoading={joinMutation.isPending}
        >
          Приєднатись
        </Button>
      </div>
    </BaseLayout>
  );
};

export default JoinLobbyPage;
