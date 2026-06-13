import { SetMetadata } from '@nestjs/common';

export const PROFILES_KEY = 'profiles';

/**
 * Restringe o endpoint aos perfis informados.
 * O valor de `profile` deve existir no payload JWT (configure em IssueTokenRequest).
 *
 * @example RestrictionByProfile(['admin'])
 */
export const RestrictionByProfile = (profiles: string[]) =>
  SetMetadata(PROFILES_KEY, profiles);
