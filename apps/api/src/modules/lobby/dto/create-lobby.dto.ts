import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { LobbyMode } from '../enums/lobby-mode.enum';

export class CreateLobbyDto {
  @ApiProperty({ example: 'Вікторина по історії' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ enum: LobbyMode, default: LobbyMode.FirstLock })
  @IsOptional()
  @IsEnum(LobbyMode)
  mode?: LobbyMode;

  @ApiPropertyOptional({ example: 15, default: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  timeoutSeconds?: number;
}
