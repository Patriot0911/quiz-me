'use client';

import { useLobbyRoom } from '../LobbyRoomProvider/context';
import ConnectionStatusBanner from '../ConnectionStatusBanner';
import BuzzerButton from '../BuzzerButton';

import styles from './styles.module.scss';

interface IParticipantBuzzerViewProps {
  nickname: string;
}

const ParticipantBuzzerView = ({ nickname }: IParticipantBuzzerViewProps) => {
  const { snapshot, connectionStatus, errorMessage, reconnect } = useLobbyRoom();

  if (connectionStatus === 'error') {
    return <p className={styles.error}>{errorMessage ?? 'Помилка підключення до лобі'}</p>;
  }

  if (!snapshot) {
    return <p className={styles.loading}>Підключення до лобі...</p>;
  }

  return (
    <div className={styles.wrapper}>
      <ConnectionStatusBanner status={connectionStatus} onReconnect={reconnect} />
      <h1 className={styles.title}>{snapshot.lobby.title}</h1>
      <p className={styles.nickname}>
        Ви приєднались як <strong>{nickname}</strong>
      </p>
      <BuzzerButton />
    </div>
  );
};

export default ParticipantBuzzerView;
