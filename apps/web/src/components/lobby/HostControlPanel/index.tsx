'use client';

import { useLobbyRoom } from '../LobbyRoomProvider/context';
import ParticipantList from '../ParticipantList';
import HostModeSettings from '../HostModeSettings';
import HostRoundControls from '../HostRoundControls';
import HostJudgeControls from '../HostJudgeControls';
import HostTimeoutControls from '../HostTimeoutControls';

import styles from './styles.module.scss';

interface IHostControlPanelProps {
  code: string;
}

const HostControlPanel = ({ code }: IHostControlPanelProps) => {
  const { snapshot, connectionStatus, errorMessage } = useLobbyRoom();

  if (connectionStatus === 'error') {
    return <p className={styles.error}>{errorMessage ?? 'Помилка підключення до лобі'}</p>;
  }

  if (!snapshot) {
    return <p className={styles.loading}>Підключення до лобі...</p>;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>{snapshot.lobby.title}</h1>
        <p className={styles.code}>
          Код для приєднання: <strong>{code}</strong>
        </p>
      </header>

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
