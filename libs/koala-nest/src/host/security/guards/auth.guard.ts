import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import { assertUserIsActive } from '@/core/auth/assert-user-active';
import { applyRefreshTokenForRefreshRoute } from '@/core/auth/resolve-refresh-token';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';
import { isObservable, lastValueFrom, Observable } from 'rxjs';

type TokenUser = Pick<AuthenticatedUser, 'sub' | 'refreshToken'>;

type AuthRequest = Parameters<typeof applyRefreshTokenForRefreshRoute>[0] & {
  user?: AuthenticatedUser | TokenUser;
};

@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  private resolveCanActivate(
    result: boolean | Promise<boolean> | Observable<boolean>,
  ): Promise<boolean> {
    if (typeof result === 'boolean') {
      return Promise.resolve(result);
    }

    if (isObservable(result)) {
      return lastValueFrom(result);
    }

    return result;
  }

  private async loadUserFromDatabase(request: AuthRequest) {
    const tokenUser = request.user;

    if (!tokenUser?.sub) {
      return;
    }

    if ('name' in tokenUser && tokenUser.name !== undefined) {
      return;
    }

    const user = await this.userRepository.getById(tokenUser.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    assertUserIsActive(user);

    request.user = {
      sub: user.id,
      name: user.name,
      profile: user.profile,
      login: user.login,
      email: user.email,
      refreshToken: tokenUser.refreshToken,
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();

    applyRefreshTokenForRefreshRoute(request);

    const activated = await this.resolveCanActivate(super.canActivate(context));

    if (!activated) {
      return false;
    }

    await this.loadUserFromDatabase(request);
    return true;
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
