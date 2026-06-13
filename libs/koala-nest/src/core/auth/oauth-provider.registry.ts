import { EnvService } from '@/infra/common/env.service';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface OAuthProviderEnvConfig {
  key: string;
  domain?: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  redirectPath?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
}

/**
 * Registry genérico de provedores OAuth2.
 *
 * Suporta **qualquer quantidade** de providers em `OAUTH2_PROVIDERS` (lista separada por vírgula).
 * Para cada CHAVE, configure `OAUTH2_{CHAVE}_*` — google/microsoft no `.env.example` são só exemplos.
 *
 * Provedor OIDC (terceiro): `OAUTH2_{CHAVE}_DOMAIN` → discovery automático.
 * Servidor OAuth próprio: `_AUTHORIZATION_URL`, `_TOKEN_URL`, `_USERINFO_URL` (sem `_DOMAIN`).
 */
@Injectable()
export class OAuthProviderRegistry {
  constructor(private readonly env: EnvService) {}

  listProviders(): string[] {
    const raw = this.env.get('OAUTH2_PROVIDERS');

    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  getProvider(key: string): OAuthProviderEnvConfig {
    const normalizedKey = key.trim().toLowerCase();
    const prefix = `OAUTH2_${normalizedKey.toUpperCase()}`;
    const domain = this.env.getDynamic(`${prefix}_DOMAIN`);
    const clientId = this.env.getDynamic(`${prefix}_CLIENT_ID`);
    const clientSecret = this.env.getDynamic(`${prefix}_CLIENT_SECRET`);
    const scope = this.env.getDynamic(`${prefix}_SCOPE`);
    const redirectPath = this.env.getDynamic(`${prefix}_REDIRECT_PATH`);
    const authorizationUrl = this.env.getDynamic(`${prefix}_AUTHORIZATION_URL`);
    const tokenUrl = this.env.getDynamic(`${prefix}_TOKEN_URL`);
    const userInfoUrl = this.env.getDynamic(`${prefix}_USERINFO_URL`);

    const hasManualEndpoints = authorizationUrl && tokenUrl && userInfoUrl;
    const hasDiscoveryDomain = Boolean(domain);

    if (!clientId || !clientSecret || !scope) {
      throw new NotFoundException(
        `Provedor OAuth2 "${normalizedKey}" não configurado. Verifique variáveis ${prefix}_* no .env`,
      );
    }

    if (!hasManualEndpoints && !hasDiscoveryDomain) {
      throw new NotFoundException(
        `Provedor OAuth2 "${normalizedKey}" incompleto. Defina ${prefix}_DOMAIN (OIDC) ou ${prefix}_AUTHORIZATION_URL, ${prefix}_TOKEN_URL e ${prefix}_USERINFO_URL`,
      );
    }

    return {
      key: normalizedKey,
      domain,
      clientId,
      clientSecret,
      scope,
      redirectPath: redirectPath ?? '/oauth2/callback',
      authorizationUrl,
      tokenUrl,
      userInfoUrl,
    };
  }
}
