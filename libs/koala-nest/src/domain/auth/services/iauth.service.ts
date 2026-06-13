import { JwtClaims } from '@/core/auth/jwt-claims';
import { AuthProviderConfigDto } from '../dtos/auth-provider-config.dto';
import { OAuthUserInfoDto } from '../dtos/oauth-user-info.dto';

export abstract class IOAuth2Service {
  abstract providerConfig(provider: string): Promise<AuthProviderConfigDto>;
  abstract authLink(provider: string, redirectUri?: string): Promise<string>;
  abstract exchangeCode(
    provider: string,
    code: string,
    state: string,
    redirectUri?: string,
  ): Promise<OAuthUserInfoDto>;
}

export abstract class IJwtTokenService {
  abstract signAccessToken(claims: JwtClaims): string;
  abstract signRefreshToken(claims: JwtClaims): string;
  abstract signTokenPair(claims: JwtClaims): {
    accessToken: string;
    refreshToken: string;
  };
}
