import { registerAs } from '@nestjs/config';

export default registerAs('lobby', () => ({
  participantToken: {
    secret:
      process.env.LOBBY_PARTICIPANT_TOKEN_SECRET ||
      'lobby_participant_token_secret_key',
    ttl: Number(process.env.LOBBY_PARTICIPANT_TOKEN_TTL) || 43200,
  },
}));
