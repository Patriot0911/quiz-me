'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useLobbyRoom } from '../LobbyRoomProvider/context';
import ParticipantList from '../ParticipantList';
import HostModeSettings from '../HostModeSettings';
import HostRoundControls from '../HostRoundControls';
import HostJudgeControls from '../HostJudgeControls';
import HostTimeoutControls from '../HostTimeoutControls';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/modals/ConfirmModal';
import useCloseLobbyMutation from '@/hooks/mutations/lobby/useCloseLobbyMutation';
import { mutationToLoadingState } from '@/lib/loading-mappers';

import styles from './styles.module.scss';

interface IHostControlPanelProps {
  code: string;
}

const HostControlPanel = ({ code }: IHostControlPanelProps) => {
  const { snapshot, connectionStatus, errorMessage } = useLobbyRoom();
  const router = useRouter();
  const closeLobbyMutation = useCloseLobbyMutation();
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  if (connectionStatus === 'error') {
    return <p className={styles.error}>{errorMessage ?? 'Помилка підключення до лобі'}</p>;
  }

  if (!snapshot) {
    return <p className={styles.loading}>Підключення до лобі...</p>;
  }

  const joinUrl = `${window.location.origin}/lobby/join/${code}`;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(joinUrl)
      .then(() => toast.success('Посилання скопійовано'))
      .catch(() => toast.error('Не вдалося скопіювати посилання'));
  };

  const handleCloseLobby = () => {
    closeLobbyMutation.mutate(code, {
      onSuccess: () => {
        toast.success('Лобі закрито');
        router.push('/lobby');
      },
      onError: () => {
        toast.error('Не вдалося закрити лобі');
      },
    });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{snapshot.lobby.title}</h1>
          <Button size="sm" variant="danger" onClick={() => setIsCloseModalOpen(true)}>
            Закрити лобі
          </Button>
        </div>
        <p className={styles.code}>
          Код для приєднання: <strong>{code}</strong>
        </p>
        <div className={styles.joinLink}>
          <a href={joinUrl} target="_blank" rel="noreferrer">
            {joinUrl}
          </a>
          <Button size="sm" variant="secondary" onClick={handleCopyLink}>
            Копіювати посилання
          </Button>
        </div>
      </header>

      <ConfirmModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirm={handleCloseLobby}
        description="Закрити це лобі? Учасники будуть відключені, а приєднатися до лобі знову буде неможливо."
        requestState={mutationToLoadingState(closeLobbyMutation)}
      />

      <section className={styles.section}>
        <HostModeSettings />
      </section>

      <section className={styles.section}>
        <HostRoundControls />
        <HostJudgeControls />
        <HostTimeoutControls />
      </section>

      <section className={styles.section}>
        <ParticipantList />
      </section>
    </div>
  );
};

export default HostControlPanel;
