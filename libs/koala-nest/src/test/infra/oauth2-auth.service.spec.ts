import { describe, expect, it } from 'bun:test';
import { OAuth2AuthService } from '@/infra/auth/oauth2-auth.service';
import { EnvService } from '@/infra/common/env.service';
import type { OAuthProviderEnvConfig } from '@/core/auth/oauth-provider.registry';
import { UnauthorizedException } from '@nestjs/common';

class CacheStub {
  readonly store = new Map<string, string>();

  get(key: string) {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string) {
    this.store.set(key, value);
    return Promise.resolve();
  }

  invalidate(key: string) {
    this.store.delete(key);
    return Promise.resolve();
  }
}

class RegistryStub {
  getProvider(key: string): OAuthProviderEnvConfig {
    return {
      key,
      domain: 'https://idp.example.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scope: 'openid',
      redirectPath: '/oauth2/callback',
    };
  }
}

function createService(cache = new CacheStub()) {
  const env = {
    get: (key: string) =>
      key === 'API_HOST' ? 'http://localhost:3000' : key === 'PORT' ? 3000 : undefined,
    getDynamic: () => undefined,
  } as unknown as EnvService;

  return new OAuth2AuthService(env, new RegistryStub() as never, cache as never);
}

function stubOAuthFetch() {
  globalThis.fetch = ((url: string) => {
    if (url.includes('openid-configuration')) {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            authorization_endpoint: 'https://idp.example.com/authorize',
            token_endpoint: 'https://idp.example.com/token',
            userinfo_endpoint: 'https://idp.example.com/userinfo',
          }),
      });
    }

    if (url.includes('/token')) {
      return Promise.resolve({
        json: () => Promise.resolve({ access_token: 'access-token' }),
      });
    }

    return Promise.resolve({
      json: () =>
        Promise.resolve({
          email: 'user@example.com',
          preferred_username: 'user',
        }),
    });
  }) as typeof fetch;
}

describe('OAuth2AuthService — state', () => {
  it('rejeita exchange quando o state não foi gravado no auth-link', async () => {
    stubOAuthFetch();
    const service = createService();

    await expect(
      service.exchangeCode('auth0', 'code-1', 'missing-state'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('valida state gravado no providerConfig e invalida após uso', async () => {
    stubOAuthFetch();
    const cache = new CacheStub();
    const service = createService(cache);

    const config = await service.providerConfig('auth0');
    const stateKey = `oauth2:state:${config.state}`;

    expect(cache.store.get(stateKey)).toContain('auth0');

    const user = await service.exchangeCode(
      'auth0',
      'code-1',
      config.state,
    );

    expect(user.email).toBe('user@example.com');
    expect(cache.store.has(stateKey)).toBe(false);
  });

  it('rejeita quando o provider do body não bate com o state gravado', async () => {
    stubOAuthFetch();
    const service = createService();

    const config = await service.providerConfig('auth0');

    await expect(
      service.exchangeCode('keycloak', 'code-1', config.state),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
