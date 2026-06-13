import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ScalarPasswordTokenHandler } from '@/application/auth/scalar-token/scalar-password-token.handler';
import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { BadRequestException } from '@nestjs/common';

describe('ScalarPasswordTokenHandler', () => {
  const issueToken = {
    handle: async (request: {
      sub: string;
      profile?: AuthProfile;
      email?: string;
      login?: string;
    }) => ({
      accessToken: `access-${request.sub}`,
      refreshToken: `refresh-${request.sub}`,
      profile: request.profile,
      email: request.email,
      login: request.login,
    }),
  } as unknown as IssueTokenHandler;

  const handler = new ScalarPasswordTokenHandler(issueToken);

  it('mapeia username/password do Scalar para claims JWT', async () => {
    const result = await handler.handle({
      username: 'user-1',
      password: AuthProfile.admin,
    });

    expect(result).toEqual({
      accessToken: 'access-user-1',
      refreshToken: 'refresh-user-1',
      profile: AuthProfile.admin,
      email: undefined,
      login: undefined,
    });
  });

  it('aceita sub/profile/email/login diretamente', async () => {
    const result = await handler.handle({
      sub: 'user-2',
      profile: AuthProfile.user,
      email: 'user@example.com',
      login: 'user-login',
    });

    expect(result.accessToken).toBe('access-user-2');
  });

  it('lança BadRequestException quando sub/username está ausente', async () => {
    await expect(
      handler.handle({ password: AuthProfile.admin }),
    ).rejects.toThrow(BadRequestException);
  });
});
