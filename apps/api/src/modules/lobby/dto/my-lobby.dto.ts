import { ApiProperty } from '@nestjs/swagger';
import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyStatus } from '../enums/lobby-status.enum';

export class MyLobbyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: LobbyMode })
  mode: LobbyMode;

  @ApiProperty()
  timeoutSeconds: number;

  @ApiProperty({ enum: LobbyStatus })
  status: LobbyStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  participantCount: number;
}
