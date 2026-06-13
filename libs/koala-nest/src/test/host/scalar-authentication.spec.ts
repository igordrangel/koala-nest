import { describe, expect, it } from 'bun:test';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import {
  IJwtTokenService,
  IOAuth2Service,
} from '@/domain/auth/services/iauth.service';
import { buildScalarAuthentication } from '@/host/open-api/scalar-authentication';
import { EnvService } from '@/infra/common/env.service';
import { Test } from '@nestjs/testing';

const envServiceMock = {
  get: (key: string) => (key === 'PORT' ? 3000 : undefined),
};

describe('buildScalarAuthentication', () => {
  it('retorna undefined quando IJwtTokenService não está registrado', async () => {
    const moduleRef = await Test.createTestingModule({}).compile();
    const app = moduleRef.createNestApplication();

    await expect(buildScalarAuthentication(app)).resolves.toBeUndefined();
    await app.close();
  });

  it('registra esquema JWT quando autenticação está ativa', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IJwtTokenService,
          useValue: { signTokenPair: () => ({ accessToken: 'a', refreshToken: 'r' }) },
        },
        { provide: EnvService, useValue: envServiceMock },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    const result = await buildScalarAuthentication(app);

    expect(result?.openApiSecuritySchemes?.JWT).toBeDefined();
    expect(result?.authentication.preferredSecurityScheme).toContain('JWT');

    await app.close();
  });

  it('registra esquemas OAuth2 via IOAuth2Service', async () => {
    const oauth2Service = {
      providerConfig: async (provider: string) => ({
        clientId: `${provider}-client`,
        clientSecret: `${provider}-secret`,
        redirectUri: 'http://localhost/callback',
        domain: 'https://oauth.example.com',
        scope: 'openid',
      }),
      authLink: async (provider: string) =>
        `https://oauth.example.com/${provider}/authorize`,
      exchangeCode: async () => ({
        email: 'user@example.com',
        login: 'user',
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IJwtTokenService,
          useValue: { signTokenPair: () => ({ accessToken: 'a', refreshToken: 'r' }) },
        },
        { provide: IOAuth2Service, useValue: oauth2Service },
        {
          provide: OAuthProviderRegistry,
          useValue: { listProviders: () => ['google'] },
        },
        { provide: EnvService, useValue: envServiceMock },
      ],
    }).compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    const result = await buildScalarAuthentication(app);

    expect(result?.openApiSecuritySchemes?.Google).toBeDefined();
    expect(result?.authentication.preferredSecurityScheme).toContain('Google');
    expect(
      result?.openApiSecuritySchemes?.Google?.flows?.authorizationCode
        ?.authorizationUrl,
    ).toContain('/oauth2/auth-link/redirect?provider=google');
    expect(
      result?.authentication.securitySchemes?.Google?.flows?.authorizationCode
        ?.tokenUrl,
    ).toContain('/oauth2/scalar-token');

    await app.close();
  });
});
