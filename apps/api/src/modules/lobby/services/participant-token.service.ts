import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IParticipantTokenPayload } from '../models/participant-token-payload.model';

@Injectable()
export class ParticipantTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async sign(lobbyId: string, participantId: string): Promise<string> {
    const payload: IParticipantTokenPayload = {
      use: 'lobby-participant',
      lobbyId,
      participantId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('lobby.participantToken.secret'),
      expiresIn: this.configService.get('lobby.participantToken.ttl'),
    });
  }

  async verify(token: string): Promise<IParticipantTokenPayload> {
    try {
      const payload =
        await this.jwtService.verifyAsync<IParticipantTokenPayload>(token, {
          secret: this.configService.get('lobby.participantToken.secret'),
        });
      if (payload.use !== 'lobby-participant') {
        throw new UnauthorizedException('Invalid participant token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid participant token');
    }
  }
}
