declare module 'passport-jwt' {
  import { Request } from 'express';

  export interface StrategyOptions {
    jwtFromRequest: (req: Request) => string | null;
    secretOrKey?: string;
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export class Strategy {
    name: string;
    constructor(options: StrategyOptions, verify: (...args: any[]) => void);
    authenticate(req: Request, options?: object): void;
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): (req: Request) => string | null;
  };
}
