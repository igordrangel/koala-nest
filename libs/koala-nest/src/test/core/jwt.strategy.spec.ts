import { describe, expect, it } from 'bun:test';
import { JwtStrategy } from '@/host/security/strategies/jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

describe('JwtStrategy', () => {
  const accessTokenTtlSeconds = 900;
  const strategy = Object.create(JwtStrategy.prototype) as JwtStrategy;
  (strategy as { accessTokenTtlSeconds: number }).accessTokenTtlSeconds =
    accessTokenTtlSeconds;

  it('rejeita refresh token em rotas que não são /auth/refresh', () => {
    const request = { url: '/person', get: () => undefined } as Request;
    const now = Math.floor(Date.now() / 1000);

    expect(() =>
      strategy.validate(request, {
        sub: 'user-1',
        iat: now,
        exp: now + 7 * 86400,
      }),
    ).toThrow(UnauthorizedException);
  });

  it('aceita refresh token em /auth/refresh', () => {
    const request = { url: '/auth/refresh', get: () => undefined } as Request;
    const now = Math.floor(Date.now() / 1000);

    const user = strategy.validate(request, {
      sub: 'user-1',
      iat: now,
      exp: now + 7 * 86400,
    });

    expect(user.sub).toBe('user-1');
    expect(user.profile).toBeUndefined();
  });
});
