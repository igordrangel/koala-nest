import { describe, expect, it } from 'bun:test';
import { AuthStrategy } from '@cli/constants/domain';
import {
  AUTH_PROFILE_MATRIX,
  forbiddenPathsForProfile,
  profileToAuthStrategies,
  requiredPathsForProfile,
  resolveAuthProfile,
} from '@cli/constants/auth-strategy-checklist';

describe('auth-strategy-checklist', () => {
  it('resolveAuthProfile cobre todas as combinações de seleção', () => {
    expect(resolveAuthProfile(false)).toBe('none');
    expect(resolveAuthProfile([])).toBe('none');
    expect(resolveAuthProfile([AuthStrategy.JWT])).toBe('jwt');
    expect(resolveAuthProfile([AuthStrategy.OAUTH2])).toBe('oauth2');
    expect(
      resolveAuthProfile([AuthStrategy.JWT, AuthStrategy.OAUTH2]),
    ).toBe('jwt+oauth2');
    expect(
      resolveAuthProfile([AuthStrategy.OAUTH2, AuthStrategy.JWT]),
    ).toBe('jwt+oauth2');
  });

  it('matriz de perfis não se sobrepõe entre obrigatórios e proibidos', () => {
    for (const profile of AUTH_PROFILE_MATRIX) {
      const required = new Set(requiredPathsForProfile(profile));
      const forbidden = forbiddenPathsForProfile(profile);
      const overlap = forbidden.filter((item) => required.has(item));

      expect(overlap).toEqual([]);
    }
  });

  it('profileToAuthStrategies converte perfil de volta para seleção CLI', () => {
    expect(profileToAuthStrategies('none')).toBe(false);
    expect(profileToAuthStrategies('jwt')).toEqual([AuthStrategy.JWT]);
    expect(profileToAuthStrategies('oauth2')).toEqual([AuthStrategy.OAUTH2]);
    expect(profileToAuthStrategies('jwt+oauth2')).toEqual([
      AuthStrategy.JWT,
      AuthStrategy.OAUTH2,
    ]);
  });

  it('jwt exige login e proíbe oauth2', () => {
    const required = requiredPathsForProfile('jwt');
    const forbidden = forbiddenPathsForProfile('jwt');

    expect(required.some((item) => item.includes('login'))).toBe(true);
    expect(forbidden.some((item) => item.includes('oauth2'))).toBe(true);
  });

  it('oauth2 exige providers e proíbe login', () => {
    const required = requiredPathsForProfile('oauth2');
    const forbidden = forbiddenPathsForProfile('oauth2');

    expect(required.some((item) => item.includes('oauth-provider.registry'))).toBe(
      true,
    );
    expect(forbidden.some((item) => item.includes('login'))).toBe(true);
  });

  it('jwt+oauth2 exige ambos e não proíbe caminhos de estratégia', () => {
    const required = requiredPathsForProfile('jwt+oauth2');
    const forbidden = forbiddenPathsForProfile('jwt+oauth2');

    expect(required.some((item) => item.includes('login'))).toBe(true);
    expect(required.some((item) => item.includes('oauth2'))).toBe(true);
    expect(forbidden).toEqual([]);
  });
});
