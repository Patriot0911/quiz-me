import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { LobbyMode } from '../enums/lobby-mode.enum';
import { LobbyRoundState } from '../enums/lobby-round-state.enum';
import { LobbyStatus } from '../enums/lobby-status.enum';
import { LobbyParticipantEntity } from './lobby-participant.entity';

@Entity('lobbies')
export class LobbyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Column()
  hostId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hostId' })
  host: UserEntity;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: LobbyMode, default: LobbyMode.FirstLock })
  mode: LobbyMode;

  @Column({ type: 'int', default: 15 })
  timeoutSeconds: number;

  @Column({ type: 'enum', enum: LobbyStatus, default: LobbyStatus.Open })
  status: LobbyStatus;

  @Column({
    type: 'enum',
    enum: LobbyRoundState,
    default: LobbyRoundState.Idle,
  })
  roundState: LobbyRoundState;

  @Column({ type: 'uuid', nullable: true })
  lockedByParticipantId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  roundArmedAt: Date | null;

  @OneToMany(() => LobbyParticipantEntity, (participant) => participant.lobby)
  participants: LobbyParticipantEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  closedAt: Date | null;
}
