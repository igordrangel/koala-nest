import { AuthHttp } from '@/core/auth/auth.constants';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import {
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable({ scope: Scope.REQUEST })
export class LoggedUserInfoService implements ILoggedUserInfoService {
  constructor(
    @Inject(REQUEST) private readonly request: AuthenticatedRequest,
  ) {}

  getUser(): LoggedUserInfoDto {
    if (!this.request?.user) {
      throw new UnauthorizedException(
        'Não foi possível recuperar suas credenciais de acesso. Gentileza reautenticar.',
      );
    }

    return LoggedUserInfoDto.fromAuthenticatedUser(this.request.user);
  }

  getToken(): string | undefined {
    return this.request.headers.authorization?.replace(
      AuthHttp.BEARER_PREFIX,
      '',
    );
  }

  isAdmin(): boolean {
    return this.getUser().profile === AuthProfile.admin;
  }
}
