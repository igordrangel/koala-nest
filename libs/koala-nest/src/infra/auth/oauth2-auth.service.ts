import { AuthHttp } from '@/core/auth/auth.constants';
import {
  CacheKeyPrefix,
  CacheTtlSeconds,
} from '@/core/constants/cache.constants';
import { randomBytes } from 'node:crypto';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import type { OAuthProviderEnvConfig } from '@/core/auth/oauth-provider.registry';
import { AuthProviderConfigResponseType } from '@/core/types/auth-provider-config-response.type';
import { AuthProviderConfigDto } from '@/domain/auth/dtos/auth-provider-config.dto';
import { OAuthUserInfoDto } from '@/domain/auth/dtos/oauth-user-info.dto';
import { IOAuth2Service } from '@/domain/auth/services/iauth.service';
import { EnvService } from '@/infra/common/env.service';
import { ICacheService } from '@/domain/common/icache.service';
import { resolveApiHost } from '@/core/utils/resolve-api-host';
import { Injectable, UnauthorizedException } from '@nestjs/common';

const OAUTH_STATE_TTL_SECONDS = CacheTtlSeconds.OAUTH2_STATE;

@Injectable()
export class OAuth2AuthService implements IOAuth2Service {
  constructor(
    private readonly env: EnvService,
    private readonly providerRegistry: OAuthProviderRegistry,
    private readonly cache: ICacheService,
  ) {}

  private generateState() {
    return randomBytes(24).toString('hex');
  }

  private stateCacheKey(state: string) {
    return `${CacheKeyPrefix.OAUTH2_STATE}${state}`;
  }

  private getApiHost() {
    return resolveApiHost(this.env.get('API_HOST'), this.env.get('PORT'));
  }

  /** Grava o state temporariamente para validar autenticidade no POST /oauth2/token (anti-CSRF). */
  private async rememberState(provider: string, state: string) {
    await this.cache.set(
      this.stateCacheKey(state),
      JSON.stringify({ provider }),
      OAUTH_STATE_TTL_SECONDS,
    );
  }

  private async validateState(provider: string, state: string) {
    const raw = await this.cache.get(this.stateCacheKey(state));

    if (!raw) {
      throw new UnauthorizedException('State OAuth2 inválido ou expirado');
    }

    const entry = JSON.parse(raw) as { provider: string };

    if (entry.provider !== provider) {
      throw new UnauthorizedException('State OAuth2 inválido ou expirado');
    }

    await this.cache.invalidate(this.stateCacheKey(state));
  }

  private async resolveProviderConfig(
    provider: string,
  ): Promise<AuthProviderConfigDto> {
    const providerConfig = this.providerRegistry.getProvider(provider);
    const endpoints = await this.resolveOAuthEndpoints(providerConfig);

    return AuthProviderConfigDto.from({
      ...endpoints,
      clientId: providerConfig.clientId,
      clientSecret: providerConfig.clientSecret,
      state: '',
      redirectUri: `${this.getApiHost()}${providerConfig.redirectPath}`,
      scope: providerConfig.scope,
    });
  }

  private async resolveOAuthEndpoints(providerConfig: OAuthProviderEnvConfig) {
    if (
      providerConfig.authorizationUrl &&
      providerConfig.tokenUrl &&
      providerConfig.userInfoUrl
    ) {
      return {
        authorizationUrl: providerConfig.authorizationUrl,
        tokenUrl: providerConfig.tokenUrl,
        userInfoUrl: providerConfig.userInfoUrl,
      };
    }

    const discovery = await fetch(
      `${providerConfig.domain}/.well-known/openid-configuration`,
    ).then(
      (response) => response.json() as Promise<AuthProviderConfigResponseType>,
    );

    return {
      authorizationUrl: discovery.authorization_endpoint,
      tokenUrl: discovery.token_endpoint,
      userInfoUrl: discovery.userinfo_endpoint,
    };
  }

  private async userInfo(
    config: AuthProviderConfigDto,
    accessToken: string,
  ): Promise<OAuthUserInfoDto> {
    const data = await fetch(config.userInfoUrl, {
      headers: { Authorization: `${AuthHttp.BEARER_PREFIX}${accessToken}` },
    }).then((response) => response.json() as Promise<Record<string, string>>);

    const email = data.email ?? data.unique_name ?? data.upn ?? '';
    const login =
      data.samaccountname ??
      data.preferred_username ??
      (email ? email.split('@')[0] : (data.sub ?? ''));

    return OAuthUserInfoDto.from({
      login,
      email,
      name: data.name,
      profile: AuthProfile.user,
    });
  }

  private async exchangeAuthorizationCode(
    provider: string,
    code: string,
    redirectUri?: string,
  ): Promise<OAuthUserInfoDto> {
    const config = await this.resolveProviderConfig(provider);

    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('redirect_uri', redirectUri ?? config.redirectUri);
    formData.append('client_id', config.clientId);
    formData.append('client_secret', config.clientSecret);
    formData.append('grant_type', 'authorization_code');

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    }).then((response) => response.json() as Promise<Record<string, string>>);

    if (tokenResponse.error || !tokenResponse.access_token) {
      throw new UnauthorizedException(
        tokenResponse.error_description ??
          tokenResponse.error ??
          'Falha ao trocar código OAuth2 por token',
      );
    }

    return this.userInfo(config, tokenResponse.access_token);
  }

  async providerConfig(provider: string): Promise<AuthProviderConfigDto> {
    const providerConfig = this.providerRegistry.getProvider(provider);
    const config = await this.resolveProviderConfig(provider);
    const state = this.generateState();
    await this.rememberState(providerConfig.key, state);

    return AuthProviderConfigDto.from({
      ...config,
      state,
    });
  }

  async resolveScalarOAuthFlow(provider: string) {
    const config = await this.resolveProviderConfig(provider);

    return {
      authorizationUrl: `${config.authorizationUrl}?scope=${encodeURIComponent(config.scope)}`,
      redirectUri: config.redirectUri,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    };
  }

  async authLink(provider: string, redirectUri?: string): Promise<string> {
    const config = await this.providerConfig(provider);
    const targetRedirect = redirectUri ?? config.redirectUri;

    return `${config.authorizationUrl}?response_type=code&client_id=${config.clientId}&state=${config.state}&redirect_uri=${encodeURIComponent(targetRedirect)}&scope=${encodeURIComponent(config.scope)}`;
  }

  async exchangeScalarCode(
    provider: string,
    code: string,
    redirectUri?: string,
  ): Promise<OAuthUserInfoDto> {
    return this.exchangeAuthorizationCode(provider, code, redirectUri);
  }

  async exchangeCode(
    provider: string,
    code: string,
    state: string,
    redirectUri?: string,
  ): Promise<OAuthUserInfoDto> {
    await this.validateState(provider, state);
    return this.exchangeAuthorizationCode(provider, code, redirectUri);
  }
}
