import { describe, expect, it } from 'bun:test';
import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { BadRequestException } from '@nestjs/common';

describe('ScalarOAuthTokenHandler', () => {
  const tokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  const exchangeCode = {
    handle: async () => tokens,
  } as unknown as OAuthExchangeCodeHandler;

  const handler = new ScalarOAuthTokenHandler(exchangeCode);

  it('delega a troca de code/state para o exchange-code handler', async () => {
    const result = await handler.handle({
      provider: 'google',
      code: 'auth-code',
      state: 'state-123',
      redirect_uri: 'http://localhost/callback',
    });

    expect(result).toEqual(tokens);
  });

  it('aceita ssoCode e redirectUri como aliases do Scalar', async () => {
    const result = await handler.handle({
      provider: 'google',
      ssoCode: 'auth-code',
      redirectUri: 'http://localhost/callback',
    });

    expect(result).toEqual(tokens);
  });

  it('não exige state (fluxo Scalar authorization code)', async () => {
    const scalarExchange = {
      handle: async (request: { state?: string }) => {
        expect(request.state).toBeUndefined();
        return tokens;
      },
    } as unknown as OAuthExchangeCodeHandler;

    const scalarHandler = new ScalarOAuthTokenHandler(scalarExchange);

    await expect(
      scalarHandler.handle({
        provider: 'google',
        code: 'auth-code',
        redirect_uri: 'http://localhost/callback',
      }),
    ).resolves.toEqual(tokens);
  });

  it('lança BadRequestException quando provider ou code estão ausentes', async () => {
    await expect(
      handler.handle({ provider: 'google', code: '' }),
    ).rejects.toThrow(BadRequestException);
  });
});
