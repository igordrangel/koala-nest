import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { ObjectClass } from '@/core/base/object-class';

export class OAuthUserInfoDto extends ObjectClass<OAuthUserInfoDto> {
  login: string;
  email: string;
  name?: string;
  profile?: AuthProfile;
}
