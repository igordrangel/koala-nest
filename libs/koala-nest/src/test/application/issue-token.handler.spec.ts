import { describe, expect, it } from 'bun:test';
import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';

describe('IssueTokenHandler', () => {
  it('gera par de tokens a partir das claims informadas', async () => {
    const jwtTokenService = {
      signTokenPair: (claims: { sub: string; profile?: string }) => ({
        accessToken: `access-${claims.sub}`,
        refreshToken: `refresh-${claims.sub}`,
      }),
    } as unknown as IJwtTokenService;

    const handler = new IssueTokenHandler(jwtTokenService);

    const result = await handler.handle({
      sub: 'user-123',
      profile: 'admin',
    });

    expect(result).toEqual({
      accessToken: 'access-user-123',
      refreshToken: 'refresh-user-123',
    });
  });
});
