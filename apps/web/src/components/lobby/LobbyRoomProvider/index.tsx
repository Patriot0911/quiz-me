'use client';

import { PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Socket } from 'socket.io-client';
import { LobbyMode } from '@/enums/lobby-mode.enum';
import { createLobbySocket, TLobbySocketAuth } from '@/lib/socket/lobbySocket';
import { IAckResponse, ILobbyEventBroadcast, ILobbySnapshot } from '@/interfaces/lobby/snapshot';
import { LobbyRoomContext, TLobbyConnectionStatus } from './context';

const EVENT_TOAST_MESSAGES: Record<string, string> = {
  judged_correct: 'Відповідь правильна! Раунд завершено.',
  judged_incorrect: 'Відповідь неправильна. Учасник у таймауті.',
  timeouts_reset: 'Всі таймаути скинуто.',
  round_armed: 'Кнопки озброєно — можна тиснути!',
  round_reset: 'Раунд скинуто.',
};

// Only toast this event when it's about the current viewer, not every participant's expiry.
const SELF_ONLY_EVENT_TOAST_MESSAGES: Record<string, string> = {
  timeout_expired: 'Ваш таймаут закінчився — можна тиснути!',
};

interface ISnapshotAckResponse extends IAckResponse {
  snapshot?: ILobbySnapshot;
}

interface ILobbyRoomProviderProps extends PropsWithChildren {
  auth: TLobbySocketAuth;
  role: 'host' | 'participant';
  selfParticipantId?: string;
}

const LobbyRoomProvider = ({
  auth,
  role,
  selfParticipantId,
  children,
}: ILobbyRoomProviderProps) => {
  const socketRef = useRef<Socket | null>(null);
  const hasConnectedOnceRef = useRef(false);
  const [connectionStatus, setConnectionStatus] = useState<TLobbyConnectionStatus>('connecting');
  const [snapshot, setSnapshot] = useState<ILobbySnapshot | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [wasKicked, setWasKicked] = useState(false);
  const [wasClosed, setWasClosed] = useState(false);

  useEffect(() => {
    const socket = createLobbySocket(auth);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (hasConnectedOnceRef.current) toast.success('З’єднання відновлено');
      hasConnectedOnceRef.current = true;
      setConnectionStatus('connected');
      setErrorMessage(null);
    });

    socket.on('disconnect', (reason) => {
      setConnectionStatus(reason === 'io server disconnect' ? 'disconnected' : 'reconnecting');
    });

    socket.on('connect_error', (error: Error) => {
      if (!hasConnectedOnceRef.current) {
        setConnectionStatus('error');
        setErrorMessage(error.message || 'Не вдалося підключитись до лобі');
      } else {
        setConnectionStatus('reconnecting');
      }
    });

    socket.io.on('reconnect_failed', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('lobby:snapshot', (data: ILobbySnapshot) => {
      setSnapshot(data);
    });

    socket.on('lobby:kicked', () => {
      setWasKicked(true);
    });

    socket.on('lobby:closed', () => {
      setWasClosed(true);
    });

    socket.on('lobby:event', (event: ILobbyEventBroadcast) => {
      const message = EVENT_TOAST_MESSAGES[event.type];
      if (message) toast(message);

      const selfOnlyMessage = SELF_ONLY_EVENT_TOAST_MESSAGES[event.type];
      if (selfOnlyMessage && event.participantId === selfParticipantId) {
        toast(selfOnlyMessage);
      }
    });

    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitAck = useCallback((event: string, payload?: unknown): Promise<IAckResponse> => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        resolve({ ok: false, reason: 'not-connected' });
        return;
      }
      socket.emit(event, payload ?? {}, (ack: IAckResponse) => resolve(ack));
    });
  }, []);

  const armRound = useCallback(() => emitAck('host:armRound'), [emitAck]);
  const resetRound = useCallback(() => emitAck('host:resetRound'), [emitAck]);
  const judge = useCallback((correct: boolean) => emitAck('host:judge', { correct }), [emitAck]);
  const resetTimeouts = useCallback(() => emitAck('host:resetTimeouts'), [emitAck]);
  const resetParticipantTimeout = useCallback(
    (participantId: string) => emitAck('host:resetParticipantTimeout', { participantId }),
    [emitAck],
  );
  const renameParticipant = useCallback(
    (participantId: string, nickname: string) =>
      emitAck('host:renameParticipant', { participantId, nickname }),
    [emitAck],
  );
  const kickParticipant = useCallback(
    (participantId: string) => emitAck('host:kickParticipant', { participantId }),
    [emitAck],
  );
  const updateSettings = useCallback(
    (changes: { mode?: LobbyMode; timeoutSeconds?: number }) =>
      emitAck('host:updateSettings', changes),
    [emitAck],
  );
  const buzz = useCallback(() => emitAck('participant:buzz'), [emitAck]);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const requestSync = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit('lobby:requestSnapshot', {}, (ack: ISnapshotAckResponse) => {
      if (ack.ok && ack.snapshot) setSnapshot(ack.snapshot);
    });
  }, []);

  return (
    <LobbyRoomContext.Provider
      value={{
        connectionStatus,
        snapshot,
        errorMessage,
        wasKicked,
        wasClosed,
        role,
        selfParticipantId,
        armRound,
        resetRound,
        judge,
        resetTimeouts,
        resetParticipantTimeout,
        renameParticipant,
        kickParticipant,
        updateSettings,
        buzz,
        reconnect,
        requestSync,
      }}
    >
      {children}
    </LobbyRoomContext.Provider>
  );
};

export default LobbyRoomProvider;
