import { describe, expect, it } from 'bun:test';
import { OAuthCallbackController } from '@/host/controllers/oauth2/oauth-callback.controller';

describe('OAuthCallbackController', () => {
  it('devolve code e state da query string', () => {
    const controller = new OAuthCallbackController();

    expect(
      controller.handle({
        code: 'auth-code',
        state: 'csrf-state',
      }),
    ).toEqual({
      code: 'auth-code',
      state: 'csrf-state',
    });
  });
});
