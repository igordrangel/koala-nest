import { describe, expect, it } from 'bun:test';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import type { IOAuth2Service } from '@/domain/auth/services/iauth.service';

describe('OAuthExchangeCodeHandler', () => {
  it('valida request e retorna dados do usuário OAuth', async () => {
    const oauth2Service = {
      exchangeCode: async (
        provider: string,
        code: string,
        state: string,
        redirectUri?: string,
      ) => ({
        email: `${provider}-${code}@example.com`,
        login: state,
        name: redirectUri ?? 'User',
        profile: 'user',
      }),
    } as IOAuth2Service;

    const handler = new OAuthExchangeCodeHandler(oauth2Service);
    const result = await handler.handle({
      provider: 'google',
      code: 'auth-code',
      state: 'csrf-state',
      redirectUri: 'http://localhost/callback',
    });

    expect(result).toEqual({
      login: 'csrf-state',
      email: 'google-auth-code@example.com',
      name: 'http://localhost/callback',
      profile: 'user',
    });
  });
});
