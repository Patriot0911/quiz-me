'use client';

import { TLobbyConnectionStatus } from '../LobbyRoomProvider/context';
import Button from '@/components/ui/Button';

import styles from './styles.module.scss';

interface IConnectionStatusBannerProps {
  status: TLobbyConnectionStatus;
  onReconnect: () => void;
}

const ConnectionStatusBanner = ({ status, onReconnect }: IConnectionStatusBannerProps) => {
  if (status === 'connected' || status === 'connecting' || status === 'error') return null;

  if (status === 'disconnected') {
    return (
      <div className={styles.banner}>
        <span>Втрачено з’єднання із сервером.</span>
        <Button size="sm" variant="secondary" onClick={onReconnect}>
          Перепідключити
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <span className={styles.spinner} aria-hidden />
      Немає з’єднання із сервером. Повторне підключення...
    </div>
  );
};

export default ConnectionStatusBanner;
