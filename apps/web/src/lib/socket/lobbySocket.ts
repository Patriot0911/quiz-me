import { io, Socket } from 'socket.io-client';

export type TLobbySocketAuth =
  | { token: string; code: string }
  | { participantToken: string };

export const createLobbySocket = (auth: TLobbySocketAuth): Socket => {
  return io(`${process.env.NEXT_PUBLIC_WS_URL}/lobby`, {
    auth,
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });
};
