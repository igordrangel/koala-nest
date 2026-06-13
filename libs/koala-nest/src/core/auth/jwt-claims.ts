import { z } from 'zod';
import { AuthProfile } from './auth-profile.enum';

export const jwtClaimsSchema = z.object({
  sub: z.string().min(1),
});

export type JwtClaims = z.infer<typeof jwtClaimsSchema>;

export const jwtPayloadSchema = jwtClaimsSchema.extend({
  exp: z.number().optional(),
  iat: z.number().optional(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export type AuthenticatedUser = JwtClaims & {
  name?: string;
  profile?: AuthProfile;
  login?: string;
  email?: string;
  refreshToken?: string;
};
