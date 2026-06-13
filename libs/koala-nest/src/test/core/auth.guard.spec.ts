import { describe, expect, it } from 'bun:test';
import { applyRefreshTokenForRefreshRoute } from '@/core/auth/resolve-refresh-token';
import { AuthGuard } from '@/host/security/guards/auth.guard';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  it('permite acesso em rotas marcadas com @IsPublic', async () => {
    const reflector = new Reflector();
    const userRepository = { getById: async () => null } as never;
    const guard = new AuthGuard(reflector, userRepository);
    const handler = () => undefined;
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);

    const context = {
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('injeta refreshToken do cookie como Bearer em /auth/refresh', () => {
    const request = {
      url: '/auth/refresh',
      cookies: { refreshToken: 'refresh-from-cookie' },
      headers: {} as Record<string, string | string[] | undefined>,
    };

    applyRefreshTokenForRefreshRoute(request);

    expect(request.headers.authorization).toBe('Bearer refresh-from-cookie');
  });

  it('injeta refreshToken do body como Bearer em /auth/refresh', () => {
    const request = {
      url: '/auth/refresh',
      body: { refresh_token: 'refresh-from-body' },
      headers: {} as Record<string, string | string[] | undefined>,
    };

    applyRefreshTokenForRefreshRoute(request);

    expect(request.headers.authorization).toBe('Bearer refresh-from-body');
  });

  it('não sobrescreve Bearer já presente em /auth/refresh', () => {
    const request = {
      url: '/auth/refresh',
      cookies: { refreshToken: 'refresh-from-cookie' },
      headers: { authorization: 'Bearer existing-token' },
    };

    applyRefreshTokenForRefreshRoute(request);

    expect(request.headers.authorization).toBe('Bearer existing-token');
  });

  it('injeta refresh_token do body mesmo com Authorization Basic (Scalar OAuth)', () => {
    const request = {
      url: '/auth/refresh',
      body: { grant_type: 'refresh_token', refresh_token: 'refresh-oauth' },
      headers: {
        authorization:
          'Basic ' + Buffer.from('client-id:client-secret').toString('base64'),
      },
    };

    applyRefreshTokenForRefreshRoute(request);

    expect(request.headers.authorization).toBe('Bearer refresh-oauth');
  });
});
