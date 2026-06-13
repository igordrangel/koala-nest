import { z } from 'zod';
import { JwtTokenType } from '@/core/auth/auth.constants';
import { AuthProfile } from './auth-profile.enum';

export const jwtClaimsSchema = z.object({
  sub: z.string().min(1),
  profile: z.nativeEnum(AuthProfile).optional(),
  login: z.string().optional(),
  email: z.string().email().optional(),
  tokenType: z.nativeEnum(JwtTokenType).optional(),
});

export type JwtClaims = z.infer<typeof jwtClaimsSchema>;

export type AuthenticatedUser = JwtClaims & {
  refreshToken?: string;
};
