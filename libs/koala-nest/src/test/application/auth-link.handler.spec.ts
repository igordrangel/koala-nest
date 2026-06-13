import { describe, expect, it } from 'bun:test';
import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import type { IOAuth2Service } from '@/domain/auth/services/iauth.service';

describe('OAuthAuthLinkHandler', () => {
  it('retorna URL de autorização do provider', async () => {
    const oauth2Service = {
      authLink: async (provider: string, redirectUri?: string) =>
        `https://oauth.example.com/${provider}?redirect=${redirectUri ?? ''}`,
    } as IOAuth2Service;

    const handler = new OAuthAuthLinkHandler(oauth2Service);
    const result = await handler.handle({
      provider: 'google',
      redirectUri: 'http://localhost/callback',
    });

    expect(result.url).toBe(
      'https://oauth.example.com/google?redirect=http://localhost/callback',
    );
  });
});
