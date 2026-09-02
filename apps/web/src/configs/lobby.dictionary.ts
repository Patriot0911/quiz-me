import { LobbyMode } from '@/enums/lobby-mode.enum';
import { LobbyStatus } from '@/enums/lobby-status.enum';

export const LOBBY_MODE_LABELS: Record<LobbyMode, string> = {
  [LobbyMode.FIRST_LOCK]: 'а) Перший тисне — блокує всіх',
  [LobbyMode.FIRST_LOCK_JUDGED]: 'а-2) Перший тисне — з оцінкою хоста',
  [LobbyMode.QUEUE]: 'б) Черга — тиснуть всі',
};

export const LOBBY_STATUS_LABELS: Record<LobbyStatus, string> = {
  [LobbyStatus.OPEN]: 'Відкрито',
  [LobbyStatus.CLOSED]: 'Закрито',
};
