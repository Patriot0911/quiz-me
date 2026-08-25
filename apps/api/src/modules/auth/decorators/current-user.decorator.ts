import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  <T = unknown>(_: unknown, ctx: ExecutionContext): T => {
    return ctx.switchToHttp().getRequest<{ user: T }>().user;
  },
);
