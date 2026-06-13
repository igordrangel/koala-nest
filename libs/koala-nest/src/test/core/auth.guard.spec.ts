import { describe, expect, it } from 'bun:test';
import {
  applyRefreshTokenFromCookie,
  AuthGuard,
} from '@/host/security/guards/auth.guard';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  it('permite acesso em rotas marcadas com @IsPublic', () => {
    const reflector = new Reflector();
    const guard = new AuthGuard(reflector);
    const handler = () => undefined;
    Reflect.defineMetadata(IS_PUBLIC_KEY, true, handler);

    const context = {
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('injeta refreshToken do cookie como Bearer em /auth/refresh', () => {
    const request = {
      url: '/auth/refresh',
      cookies: { refreshToken: 'refresh-from-cookie' },
      headers: {} as Record<string, string | string[] | undefined>,
    };

    applyRefreshTokenFromCookie(request);

    expect(request.headers.authorization).toBe('Bearer refresh-from-cookie');
  });

  it('não sobrescreve Authorization já presente em /auth/refresh', () => {
    const request = {
      url: '/auth/refresh',
      cookies: { refreshToken: 'refresh-from-cookie' },
      headers: { authorization: 'Bearer existing-token' },
    };

    applyRefreshTokenFromCookie(request);

    expect(request.headers.authorization).toBe('Bearer existing-token');
  });
});
