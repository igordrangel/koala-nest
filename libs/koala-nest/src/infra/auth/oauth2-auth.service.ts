import { randomBytes } from 'node:crypto';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import { AuthProviderConfigResponseType } from '@/core/types/auth-provider-config-response.type';
import { AuthProviderConfigDto } from '@/domain/auth/dtos/auth-provider-config.dto';
import { OAuthUserInfoDto } from '@/domain/auth/dtos/oauth-user-info.dto';
import { IOAuth2Service } from '@/domain/auth/services/iauth.service';
import { EnvService } from '@/infra/common/env.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class OAuth2AuthService implements IOAuth2Service {
  private readonly pendingStates = new Map<
    string,
    { provider: string; expiresAt: number }
  >();

  constructor(
    private readonly env: EnvService,
    private readonly providerRegistry: OAuthProviderRegistry,
  ) {}

  private generateState() {
    return randomBytes(24).toString('hex');
  }

  private rememberState(provider: string, state: string) {
    this.pendingStates.set(state, {
      provider,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });
  }

  private validateState(provider: string, state: string) {
    const entry = this.pendingStates.get(state);

    if (!entry || entry.provider !== provider || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('State OAuth2 inválido ou expirado');
    }

    this.pendingStates.delete(state);
  }

  private getApiHost() {
    const host =
      this.env.get('API_HOST') ?? `http://localhost:${this.env.get('PORT')}`;
    return host.replace(/\/$/, '');
  }

  private async resolveProviderConfig(
    provider: string,
  ): Promise<AuthProviderConfigDto> {
    const providerConfig = this.providerRegistry.getProvider(provider);

    const discovery = await fetch(
      `${providerConfig.domain}/.well-known/openid-configuration`,
    ).then(
      (response) => response.json() as Promise<AuthProviderConfigResponseType>,
    );

    return AuthProviderConfigDto.from({
      authorizationUrl: discovery.authorization_endpoint,
      tokenUrl: discovery.token_endpoint,
      userInfoUrl: discovery.userinfo_endpoint,
      clientId: providerConfig.clientId,
      clientSecret: providerConfig.clientSecret,
      state: '',
      redirectUri: `${this.getApiHost()}${providerConfig.redirectPath}`,
      scope: providerConfig.scope,
    });
  }

  async providerConfig(provider: string): Promise<AuthProviderConfigDto> {
    const providerConfig = this.providerRegistry.getProvider(provider);
    const config = await this.resolveProviderConfig(provider);
    const state = this.generateState();
    this.rememberState(providerConfig.key, state);

    return AuthProviderConfigDto.from({
      ...config,
      state,
    });
  }

  async authLink(provider: string, redirectUri?: string): Promise<string> {
    const config = await this.providerConfig(provider);
    const targetRedirect = redirectUri ?? config.redirectUri;

    return `${config.authorizationUrl}?response_type=code&client_id=${config.clientId}&state=${config.state}&redirect_uri=${encodeURIComponent(targetRedirect)}&scope=${encodeURIComponent(config.scope)}`;
  }

  async exchangeCode(
    provider: string,
    code: string,
    state: string,
    redirectUri?: string,
  ): Promise<OAuthUserInfoDto> {
    this.validateState(provider, state);
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
      throw new UnauthorizedException('Falha ao trocar código OAuth2 por token');
    }

    return this.userInfo(config, tokenResponse.access_token);
  }

  private async userInfo(
    config: AuthProviderConfigDto,
    accessToken: string,
  ): Promise<OAuthUserInfoDto> {
    const data = await fetch(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
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
      profile: 'user',
    });
  }
}
