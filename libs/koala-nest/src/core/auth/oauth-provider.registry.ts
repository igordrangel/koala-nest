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

  listConfiguredProviders(): string[] {
    return this.listProviders().filter((key) => {
      try {
        this.getProvider(key);
        return true;
      } catch {
        return false;
      }
    });
  }

  getProvider(key: string): OAuthProviderEnvConfig {
    const normalizedKey = key.trim().toLowerCase();
    const entry = this.env.get('OAUTH2_PROVIDER_ENV')[normalizedKey];
    const domain = entry?.domain;
    const clientId = entry?.clientId;
    const clientSecret = entry?.clientSecret;
    const scope = entry?.scope;
    const redirectPath = entry?.redirectPath;
    const authorizationUrl = entry?.authorizationUrl;
    const tokenUrl = entry?.tokenUrl;
    const userInfoUrl = entry?.userInfoUrl;

    const hasManualEndpoints = authorizationUrl && tokenUrl && userInfoUrl;
    const hasDiscoveryDomain = Boolean(domain);

    if (!clientId || !clientSecret || !scope) {
      const prefix = `OAUTH2_${normalizedKey.toUpperCase()}`;
      throw new NotFoundException(
        `Provedor OAuth2 "${normalizedKey}" não configurado. Verifique variáveis ${prefix}_* no .env`,
      );
    }

    if (!hasManualEndpoints && !hasDiscoveryDomain) {
      const prefix = `OAUTH2_${normalizedKey.toUpperCase()}`;
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
      redirectPath: redirectPath ?? '/sso/callback',
      authorizationUrl,
      tokenUrl,
      userInfoUrl,
    };
  }
}
