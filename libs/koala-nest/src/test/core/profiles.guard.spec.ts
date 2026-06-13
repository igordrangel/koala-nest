import { describe, expect, it } from 'bun:test';
import { ProfilesGuard } from '@/host/security/guards/profiles.guard';
import { PROFILES_KEY } from '@/host/decorators/restriction-by-profile.decorator';
import { Reflector } from '@nestjs/core';
import { createGuardContext } from '@/test/utils/guard-test-context';

describe('ProfilesGuard', () => {
  it('permite acesso quando não há restrição de perfil', () => {
    const reflector = new Reflector();
    const guard = new ProfilesGuard(reflector);
    const { context } = createGuardContext({ user: { sub: '1', profile: 'admin' } });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('permite acesso quando o perfil do token está na lista', () => {
    const reflector = new Reflector();
    const guard = new ProfilesGuard(reflector);
    const { context } = createGuardContext({
      user: { sub: '1', profile: 'admin' },
      metadataKey: PROFILES_KEY,
      metadata: { [PROFILES_KEY]: ['admin', 'user'] },
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('bloqueia acesso quando o perfil não está autorizado', () => {
    const reflector = new Reflector();
    const guard = new ProfilesGuard(reflector);
    const { context } = createGuardContext({
      user: { sub: '1', profile: 'user' },
      metadataKey: PROFILES_KEY,
      metadata: { [PROFILES_KEY]: ['admin'] },
    });

    expect(guard.canActivate(context)).toBe(false);
  });
});
