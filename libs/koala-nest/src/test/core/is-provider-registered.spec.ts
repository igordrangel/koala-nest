import { describe, expect, it } from 'bun:test';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { isProviderRegistered } from '@/core/utils/is-provider-registered';
import { Test } from '@nestjs/testing';

describe('isProviderRegistered', () => {
  it('retorna true quando o token está registrado em algum módulo', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: IJwtTokenService,
          useValue: {
            signTokenPair: () => ({ accessToken: 'a', refreshToken: 'r' }),
          },
        },
      ],
    }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    expect(isProviderRegistered(app, IJwtTokenService)).toBe(true);

    await app.close();
  });

  it('retorna false quando o token não está registrado', async () => {
    const moduleRef = await Test.createTestingModule({}).compile();
    const app = moduleRef.createNestApplication();
    await app.init();

    expect(isProviderRegistered(app, IJwtTokenService)).toBe(false);

    await app.close();
  });
});
