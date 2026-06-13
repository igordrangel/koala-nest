import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import { PROFILES_KEY } from '@/host/decorators/restriction-by-profile.decorator';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class ProfilesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const profiles = this.reflector.getAllAndOverride<string[]>(PROFILES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!profiles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const profile = request.user?.profile;

    if (!profile) {
      return false;
    }

    return profiles.includes(profile);
  }
}
