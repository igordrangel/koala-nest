import { describe, expect, it } from 'bun:test';
import { AuthGuard } from '@/host/security/guards/auth.guard';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import { Reflector } from '@nestjs/core';
import { createGuardContext } from '@/test/utils/guard-test-context';

describe('AuthGuard', () => {
  it('permite acesso em rotas marcadas com @IsPublic', () => {
    const reflector = new Reflector();
    const guard = new AuthGuard(reflector);
    const { context } = createGuardContext({
      metadataKey: IS_PUBLIC_KEY,
      metadata: { [IS_PUBLIC_KEY]: true },
    });

    expect(guard.canActivate(context)).toBe(true);
  });
});
