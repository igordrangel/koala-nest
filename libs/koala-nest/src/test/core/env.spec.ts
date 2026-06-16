import { describe, expect, it } from 'bun:test';
import { parseOAuth2ProviderEnv } from '@/core/auth/parse-oauth2-provider-env';
import { envSchema, validateEnvConfig } from '@/core/env';

describe('envSchema', () => {
  it('define HOST com default 0.0.0.0 para bind em container', () => {
    const env = envSchema.parse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
    });

    expect(env.HOST).toBe('0.0.0.0');
  });

  it('interpreta CRON_JOBS_ENABLED=false como desabilitado', () => {
    const env = envSchema.parse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
      CRON_JOBS_ENABLED: 'false',
    });

    expect(env.CRON_JOBS_ENABLED).toBe(false);
  });

  it('define rate limit desabilitado por padrão', () => {
    const env = envSchema.parse({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
    });

    expect(env.RATE_LIMIT_MAX).toBe(0);
    expect(env.RATE_LIMIT_WINDOW_MS).toBe(60_000);
  });
});

describe('parseOAuth2ProviderEnv', () => {
  it('agrupa variáveis OAUTH2_{PROVIDER}_* por provider', () => {
    expect(
      parseOAuth2ProviderEnv({
        OAUTH2_GOOGLE_DOMAIN: 'https://accounts.google.com',
        OAUTH2_GOOGLE_CLIENT_ID: 'client-id',
        OAUTH2_GOOGLE_CLIENT_SECRET: 'client-secret',
        OAUTH2_GOOGLE_SCOPE: 'openid profile email',
        OAUTH2_MYAPP_AUTHORIZATION_URL:
          'https://auth.myapp.com/oauth/authorize',
      }),
    ).toEqual({
      google: {
        domain: 'https://accounts.google.com',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        scope: 'openid profile email',
      },
      myapp: {
        authorizationUrl: 'https://auth.myapp.com/oauth/authorize',
      },
    });
  });
});

describe('validateEnvConfig', () => {
  it('normaliza OAuth2 no env tipado OAUTH2_PROVIDER_ENV', () => {
    const env = validateEnvConfig({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgres://localhost/test',
      OAUTH2_GOOGLE_CLIENT_ID: 'client-id',
      OAUTH2_GOOGLE_CLIENT_SECRET: 'client-secret',
      OAUTH2_GOOGLE_SCOPE: 'openid',
      OAUTH2_GOOGLE_DOMAIN: 'https://accounts.google.com',
    });

    expect(env.OAUTH2_PROVIDER_ENV.google).toEqual({
      domain: 'https://accounts.google.com',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      scope: 'openid',
    });
    expect(env.NODE_ENV).toBe('test');
  });
});
