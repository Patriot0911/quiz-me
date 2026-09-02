import { z } from 'zod';
import { LobbyMode } from '@/enums/lobby-mode.enum';

export const createLobbySchema = z.object({
  title: z.string().min(3, 'Мінімум 3 символи').max(100, 'Максимум 100 символів'),
  mode: z.enum([LobbyMode.FIRST_LOCK, LobbyMode.FIRST_LOCK_JUDGED, LobbyMode.QUEUE]),
  timeoutSeconds: z.coerce.number().min(1, 'Мінімум 1 секунда').max(600, 'Максимум 600 секунд'),
});

export type TCreateLobbyFormInput = z.input<typeof createLobbySchema>;
export type TCreateLobbyFormOutput = z.output<typeof createLobbySchema>;
