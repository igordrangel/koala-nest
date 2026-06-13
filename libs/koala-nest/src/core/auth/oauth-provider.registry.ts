import { EnvService } from '@/infra/common/env.service';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface OAuthProviderEnvConfig {
  key: string;
  domain: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  redirectPath?: string;
}

/**
 * Registry genérico de provedores OAuth2.
 *
 * Configure no `.env`:
 * - OAUTH2_PROVIDERS=google,microsoft
 * - OAUTH2_GOOGLE_DOMAIN=https://accounts.google.com
 * - OAUTH2_GOOGLE_CLIENT_ID=...
 * - OAUTH2_GOOGLE_CLIENT_SECRET=...
 * - OAUTH2_GOOGLE_SCOPE=openid profile email
 *
 * Repita o padrão para cada provider listado em OAUTH2_PROVIDERS.
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

    if (!domain || !clientId || !clientSecret || !scope) {
      throw new NotFoundException(
        `Provedor OAuth2 "${normalizedKey}" não configurado. Verifique variáveis ${prefix}_* no .env`,
      );
    }

    return {
      key: normalizedKey,
      domain,
      clientId,
      clientSecret,
      scope,
      redirectPath: redirectPath ?? '/oauth2/callback',
    };
  }
}
