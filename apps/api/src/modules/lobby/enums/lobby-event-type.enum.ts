export enum LobbyEventType {
  ParticipantJoined = 'participant_joined',
  ParticipantDisconnected = 'participant_disconnected',
  ParticipantReconnected = 'participant_reconnected',
  RoundArmed = 'round_armed',
  RoundReset = 'round_reset',
  Buzz = 'buzz',
  JudgedCorrect = 'judged_correct',
  JudgedIncorrect = 'judged_incorrect',
  TimeoutSet = 'timeout_set',
  TimeoutsReset = 'timeouts_reset',
  ModeChanged = 'mode_changed',
}
