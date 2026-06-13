import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { RefreshTokenHandler } from '@/application/auth/refresh-token/refresh-token.handler';
import { LoggedUserInfoDto } from '@/domain/dtos/logged-user-info.dto';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { LoggedUserInfoFakeService } from '@/test/services/logged-user-info.fake-service';

describe('RefreshTokenHandler', () => {
  it('emite novo par de tokens a partir do usuário logado', async () => {
    const jwtTokenService = {
      signTokenPair: (claims: { sub: string; profile?: AuthProfile }) => ({
        accessToken: `access-${claims.sub}`,
        refreshToken: `refresh-${claims.sub}`,
      }),
    } as unknown as IJwtTokenService;

    const loggedUserInfo = new LoggedUserInfoFakeService();
    loggedUserInfo.setContext({
      user: Object.assign(new LoggedUserInfoDto(), {
        sub: 'user-1',
        profile: AuthProfile.admin,
      }),
    });

    const handler = new RefreshTokenHandler(
      jwtTokenService,
      loggedUserInfo,
    );

    const result = await handler.handle();

    expect(result).toEqual({
      accessToken: 'access-user-1',
      refreshToken: 'refresh-user-1',
    });
  });
});
