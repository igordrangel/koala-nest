import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { AuthenticatedUser } from '@/core/auth/jwt-claims';
import { AutoMap } from '@/core/tools/mapping';

export class LoggedUserInfoDto {
  @AutoMap()
  sub: string;

  @AutoMap()
  profile?: AuthProfile;

  @AutoMap()
  login?: string;

  @AutoMap()
  email?: string;

  static fromAuthenticatedUser(user: AuthenticatedUser): LoggedUserInfoDto {
    return Object.assign(new LoggedUserInfoDto(), {
      sub: user.sub,
      profile: user.profile,
      login: user.login,
      email: user.email,
    });
  }
}
