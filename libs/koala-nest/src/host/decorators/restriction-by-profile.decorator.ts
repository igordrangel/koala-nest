import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { SetMetadata } from '@nestjs/common';

export const PROFILES_KEY = 'profiles';

/**
 * Restringe o endpoint aos perfis informados.
 * O valor de `profile` deve existir no payload JWT (configure em IssueTokenRequest).
 *
 * @example RestrictionByProfile([AuthProfile.admin])
 */
export const RestrictionByProfile = (profiles: AuthProfile[]) =>
  SetMetadata(PROFILES_KEY, profiles);
