import { JwtClaims } from '@/core/auth/jwt-claims';
import { User } from '@/domain/entities/user/user';

export function userToJwtClaims(user: User): JwtClaims {
  return { sub: user.id };
}
