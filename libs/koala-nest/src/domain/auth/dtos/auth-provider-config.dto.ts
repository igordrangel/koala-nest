import { ObjectClass } from '@/core/base/object-class';

export class AuthProviderConfigDto extends ObjectClass<AuthProviderConfigDto> {
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  clientId: string;
  clientSecret: string;
  state: string;
  redirectUri: string;
  scope: string;
}
