import { describe, expect, it } from 'bun:test';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import { validateEnvConfig } from '@/core/env';
import { EnvService } from '@/infra/common/env.service';

function createRegistry(flat: Record<string, string | undefined>) {
  const env = validateEnvConfig({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://localhost/test',
    ...flat,
  });
  const envService = {
    get: <T extends keyof typeof env>(key: T) => env[key],
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
      redirectPath: '/sso/callback',
      authorizationUrl: undefined,
      tokenUrl: undefined,
      userInfoUrl: undefined,
    });
  });

  it('resolve provider com endpoints manuais para servidor OAuth próprio', () => {
    const registry = createRegistry({
      OAUTH2_PROVIDERS: 'myapp',
      OAUTH2_MYAPP_CLIENT_ID: 'client-id',
      OAUTH2_MYAPP_CLIENT_SECRET: 'client-secret',
      OAUTH2_MYAPP_SCOPE: 'openid profile email',
      OAUTH2_MYAPP_AUTHORIZATION_URL: 'https://auth.myapp.com/oauth/authorize',
      OAUTH2_MYAPP_TOKEN_URL: 'https://auth.myapp.com/oauth/token',
      OAUTH2_MYAPP_USERINFO_URL: 'https://auth.myapp.com/oauth/userinfo',
    });

    expect(registry.getProvider('myapp')).toEqual({
      key: 'myapp',
      domain: undefined,
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scope: 'openid profile email',
      redirectPath: '/sso/callback',
      authorizationUrl: 'https://auth.myapp.com/oauth/authorize',
      tokenUrl: 'https://auth.myapp.com/oauth/token',
      userInfoUrl: 'https://auth.myapp.com/oauth/userinfo',
    });
  });
});
