import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { describe, expect, it } from 'bun:test';
import { LoginHandler } from '@/application/auth/login/login.handler';
import { UserStatus } from '@/domain/entities/user/enums/user-status.enum';
import { User } from '@/domain/entities/user/user';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginHandler', () => {
  const user = Object.assign(new User(), {
    id: 'user-123',
    email: 'admin@example.com',
    login: 'admin.demo',
    password: '$2b$06$eyA412UuUAPsAOBREzXPue1AJW.GLAwjenHRSBVCc1.gB1AcASWo6',
    profile: AuthProfile.admin,
    status: UserStatus.active,
    name: 'Admin Demo',
  });

  const userRepository = {
    getByEmail: async (email: string) =>
      email === 'admin@example.com' ? user : null,
  } as unknown as IUserRepository;

  const jwtTokenService = {
    signTokenPair: (claims: { sub: string }) => ({
      accessToken: `access-${claims.sub}`,
      refreshToken: `refresh-${claims.sub}`,
    }),
  } as unknown as IJwtTokenService;

  const handler = new LoginHandler(userRepository, jwtTokenService);

  it('gera par de tokens com credenciais válidas', async () => {
    const result = await handler.handle({
      username: 'admin@example.com',
      password: 'admin123',
    });

    expect(result).toEqual({
      accessToken: 'access-user-123',
      refreshToken: 'refresh-user-123',
    });
  });

  it('rejeita credenciais inválidas', async () => {
    await expect(
      handler.handle({
        username: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
