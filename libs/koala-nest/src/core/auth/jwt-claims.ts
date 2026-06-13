import { z } from 'zod';

export const jwtClaimsSchema = z.object({
  sub: z.string().min(1),
  profile: z.string().optional(),
  login: z.string().optional(),
  email: z.string().email().optional(),
});

export type JwtClaims = z.infer<typeof jwtClaimsSchema>;

export type AuthenticatedUser = JwtClaims & {
  refreshToken?: string;
};
