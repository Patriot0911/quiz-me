export interface IStoredLobbyParticipant {
  participantId: string;
  nickname: string;
  participantToken: string;
}

const storageKey = (code: string) => `lobby_participant_token:${code}`;

export const getStoredParticipant = (code: string): IStoredLobbyParticipant | null => {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(storageKey(code));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as IStoredLobbyParticipant;
  } catch {
    return null;
  }
};

export const setStoredParticipant = (
  code: string,
  data: IStoredLobbyParticipant,
): void => {
  localStorage.setItem(storageKey(code), JSON.stringify(data));
};

export const clearStoredParticipant = (code: string): void => {
  localStorage.removeItem(storageKey(code));
};
