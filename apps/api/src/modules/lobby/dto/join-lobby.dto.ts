import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class JoinLobbyDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(1, 32)
  nickname: string;
}
