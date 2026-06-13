import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { LoggedUserInfoService } from '@/infra/services/logged-user-info.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LoggedUserInfoService', () => {
  it('retorna usuário a partir do request', () => {
    const service = new LoggedUserInfoService({
      user: {
        sub: 'user-1',
        name: 'Demo User',
        profile: AuthProfile.admin,
        login: 'user-login',
        email: 'user@example.com',
      },
      headers: {},
    } as never);

    expect(service.getUser()).toEqual({
      sub: 'user-1',
      name: 'Demo User',
      profile: AuthProfile.admin,
      login: 'user-login',
      email: 'user@example.com',
    });
  });

  it('lança UnauthorizedException quando não há usuário no request', () => {
    const service = new LoggedUserInfoService({ headers: {} } as never);

    expect(() => service.getUser()).toThrow(UnauthorizedException);
  });
});
