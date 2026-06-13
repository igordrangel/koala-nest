import { describe, expect, it } from 'bun:test';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import { EnvService } from '@/infra/common/env.service';

function createRegistry(env: Record<string, string | undefined>) {
  const envService = {
    get: (key: 'OAUTH2_PROVIDERS') => env[key],
    getDynamic: (key: string) => env[key],
  } as unknown as EnvService;

  return new OAuthProviderRegistry(envService);
}

describe('OAuthProviderRegistry', () => {
  it('retorna lista vazia quando OAUTH2_PROVIDERS não está definido', () => {
    const registry = createRegistry({});

    expect(registry.listProviders()).toEqual([]);
  });

  it('lista providers normalizados a partir do env', () => {
    const registry = createRegistry({
      OAUTH2_PROVIDERS: ' Google , Microsoft ',
    });

    expect(registry.listProviders()).toEqual(['google', 'microsoft']);
  });

  it('resolve configuração do provider pelas variáveis OAUTH2_{KEY}_*', () => {
    const registry = createRegistry({
      OAUTH2_PROVIDERS: 'google',
      OAUTH2_GOOGLE_DOMAIN: 'https://accounts.google.com',
      OAUTH2_GOOGLE_CLIENT_ID: 'client-id',
      OAUTH2_GOOGLE_CLIENT_SECRET: 'client-secret',
      OAUTH2_GOOGLE_SCOPE: 'openid profile email',
    });

    expect(registry.getProvider('google')).toEqual({
      key: 'google',
      domain: 'https://accounts.google.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scope: 'openid profile email',
      redirectPath: '/oauth2/callback',
    });
  });
});
