import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import { AuthHttp } from '@/core/auth/auth.constants';
import { isAuthRefreshRoute } from '@/core/auth/auth-routes';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

type AuthRequest = {
  cookies?: Record<string, string>;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};

export function applyRefreshTokenFromCookie(request: AuthRequest): void {
  if (
    isAuthRefreshRoute(request.url) &&
    request.cookies?.[AuthHttp.REFRESH_TOKEN_COOKIE] &&
    !request.headers.authorization
  ) {
    request.headers.authorization = `${AuthHttp.BEARER_PREFIX}${request.cookies[AuthHttp.REFRESH_TOKEN_COOKIE]}`;
  }
}

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    applyRefreshTokenFromCookie(request);

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw err ?? new UnauthorizedException();
    }

    return user;
  }
}
