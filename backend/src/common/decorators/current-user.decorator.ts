import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, AccountStatus } from '../enums/roles.enum';
import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerifiedAt?: Date | null;
  sessionId?: string;
}

type AuthRequest = Request & { user?: AuthenticatedUser };

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthRequest>();

    const user = request.user;

    return data ? user?.[data] : user;
  },
);
