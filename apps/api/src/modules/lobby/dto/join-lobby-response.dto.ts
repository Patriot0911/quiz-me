import { ApiProperty } from '@nestjs/swagger';

export class JoinLobbyResponseDto {
  @ApiProperty()
  lobbyId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  participantId: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  participantToken: string;
}
