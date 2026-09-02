import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LobbyEventType } from '../enums/lobby-event-type.enum';

@Entity('lobby_events')
export class LobbyEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  lobbyId: string;

  @Column({ type: 'uuid', nullable: true })
  participantId: string | null;

  @Column({ type: 'enum', enum: LobbyEventType })
  type: LobbyEventType;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
