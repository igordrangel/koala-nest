import { describe, expect, it } from 'bun:test';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { UserStatus } from '@/domain/entities/user/enums/user-status.enum';
import { User } from '@/domain/entities/user/user';
import type {
  IOAuth2Service,
  IJwtTokenService,
} from '@/domain/auth/services/iauth.service';
import type { IUserRepository } from '@/domain/repositories/iuser.repository';

describe('OAuthExchangeCodeHandler', () => {
  it('cria usuário quando necessário e retorna par de tokens JWT', async () => {
    const oauth2Service = {
      exchangeCode: async (provider: string, code: string, state: string) => ({
        email: `${provider}-${code}@example.com`,
        login: state,
        name: 'OAuth User',
        profile: AuthProfile.user,
      }),
    } as IOAuth2Service;

    const savedUser = Object.assign(new User(), {
      id: 'user-oauth-1',
      email: 'google-auth-code@example.com',
      login: 'oauth.user',
      name: 'OAuth User',
      profile: AuthProfile.user,
      status: UserStatus.active,
      password: 'hashed',
    });

    const userRepository = {
      getByEmail: async () => null,
      getByLogin: async () => null,
      save: async (user: User) => {
        Object.assign(savedUser, user, { id: 'user-oauth-1' });
        return savedUser;
      },
    } as unknown as IUserRepository;

    const jwtTokenService = {
      signTokenPair: (claims: { sub: string }) => ({
        accessToken: `access-${claims.sub}`,
        refreshToken: `refresh-${claims.sub}`,
      }),
    } as unknown as IJwtTokenService;

    const handler = new OAuthExchangeCodeHandler(
      oauth2Service,
      userRepository,
      jwtTokenService,
    );

    const result = await handler.handle({
      provider: 'google',
      code: 'auth-code',
      state: 'csrf-state',
      redirectUri: 'http://localhost/callback',
    });

    expect(result).toEqual({
      accessToken: 'access-user-oauth-1',
      refreshToken: 'refresh-user-oauth-1',
    });
  });
});
