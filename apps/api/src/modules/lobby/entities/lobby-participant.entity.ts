import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ParticipantStatus } from '../enums/participant-status.enum';
import { LobbyEntity } from './lobby.entity';

@Entity('lobby_participants')
export class LobbyParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  lobbyId: string;

  @ManyToOne(() => LobbyEntity, (lobby) => lobby.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lobbyId' })
  lobby: LobbyEntity;

  @Column()
  nickname: string;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.Active,
  })
  status: ParticipantStatus;

  @Column({ type: 'timestamptz', nullable: true })
  timeoutUntil: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt: Date | null;
}
