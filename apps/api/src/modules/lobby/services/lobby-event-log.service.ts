import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LobbyEventEntity } from '../entities/lobby-event.entity';
import { LobbyEventType } from '../enums/lobby-event-type.enum';

@Injectable()
export class LobbyEventLogService {
  private readonly logger = new Logger(LobbyEventLogService.name);

  constructor(
    @InjectRepository(LobbyEventEntity)
    private readonly eventRepository: Repository<LobbyEventEntity>,
  ) {}

  log(
    lobbyId: string,
    type: LobbyEventType,
    participantId?: string | null,
    payload?: Record<string, unknown> | null,
  ): void {
    const event = this.eventRepository.create({
      lobbyId,
      type,
      participantId: participantId ?? null,
      payload: payload ?? null,
    });

    this.eventRepository
      .save(event)
      .catch((error) =>
        this.logger.error(
          `Failed to persist lobby event ${type} for lobby ${lobbyId}`,
          error,
        ),
      );
  }
}
