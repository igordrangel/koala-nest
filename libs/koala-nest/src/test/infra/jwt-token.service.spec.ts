import { describe, expect, it } from 'bun:test';
import { JwtTokenService } from '@/infra/auth/jwt-token.service';
import { EnvService } from '@/infra/common/env.service';
import { JwtService } from '@nestjs/jwt';

describe('JwtTokenService', () => {
  it('gera access e refresh token apenas com sub', () => {
    const jwtService = {
      sign: (claims: { sub: string }, options: { expiresIn: string }) =>
        `${options.expiresIn}:${claims.sub}`,
    } as unknown as JwtService;

    const envService = {
      get: (
        key: 'JWT_ACCESS_TOKEN_EXPIRES_IN' | 'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ) => (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN' ? '15m' : '7d'),
    } as unknown as EnvService;

    const service = new JwtTokenService(jwtService, envService);

    expect(service.signTokenPair({ sub: 'user-1' })).toEqual({
      accessToken: '15m:user-1',
      access_token: '15m:user-1',
      refreshToken: '7d:user-1',
      refresh_token: '7d:user-1',
    });
  });
});
