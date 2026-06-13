import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { BadRequestException } from '@nestjs/common';

describe('ScalarOAuthTokenHandler', () => {
  const userInfo = {
    email: 'user@example.com',
    login: 'user-1',
    profile: AuthProfile.admin,
  };

  const exchangeCode = {
    handle: async () => userInfo,
  } as unknown as OAuthExchangeCodeHandler;

  const issueToken = {
    handle: async (request: {
      sub: string;
      profile?: AuthProfile;
      email?: string;
      login?: string;
    }) => ({
      accessToken: `access-${request.sub}`,
      refreshToken: `refresh-${request.sub}`,
    }),
  } as unknown as IssueTokenHandler;

  const handler = new ScalarOAuthTokenHandler(exchangeCode, issueToken);

  it('mapeia code/state do Scalar para claims JWT via exchange-code', async () => {
    const result = await handler.handle({
      provider: 'google',
      code: 'auth-code',
      state: 'state-123',
      redirect_uri: 'http://localhost/callback',
    });

    expect(result).toEqual({
      accessToken: 'access-user@example.com',
      refreshToken: 'refresh-user@example.com',
    });
  });

  it('aceita ssoCode e redirectUri como aliases do Scalar', async () => {
    const result = await handler.handle({
      provider: 'google',
      ssoCode: 'auth-code',
      state: 'state-123',
      redirectUri: 'http://localhost/callback',
    });

    expect(result.accessToken).toBe('access-user@example.com');
  });

  it('lança BadRequestException quando campos obrigatórios estão ausentes', async () => {
    await expect(
      handler.handle({ provider: 'google', code: '', state: 'state-123' }),
    ).rejects.toThrow(BadRequestException);
  });
});
