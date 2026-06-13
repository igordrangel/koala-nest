import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { JwtStrategy } from '@/host/security/strategies/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

describe('JwtStrategy', () => {
  const strategy = Object.create(JwtStrategy.prototype) as JwtStrategy;

  it('rejeita refresh token em rotas que não são /auth/refresh', () => {
    const request = { url: '/person', get: () => undefined } as Request;

    expect(() =>
      strategy.validate(request, {
        sub: 'user-1',
        tokenType: 'refresh',
      }),
    ).toThrow(UnauthorizedException);
  });

  it('aceita refresh token em /auth/refresh', () => {
    const request = { url: '/auth/refresh', get: () => undefined } as Request;

    const user = strategy.validate(request, {
      sub: 'user-1',
      profile: AuthProfile.admin,
      tokenType: 'refresh',
    });

    expect(user.sub).toBe('user-1');
    expect(user.profile).toBe(AuthProfile.admin);
  });
});
