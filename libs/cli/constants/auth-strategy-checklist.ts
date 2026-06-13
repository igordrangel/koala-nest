import { AuthStrategy } from '@cli/constants/domain';
import {
  JWT_ONLY_REMOVE_PATHS,
  OAUTH2_ONLY_REMOVE_PATHS,
} from './auth-strategy-artifacts';

export type AuthProfile = 'none' | 'jwt' | 'oauth2' | 'jwt+oauth2';

export type AuthStrategySelection = false | readonly AuthStrategy[];

/** Caminhos que devem existir quando há autenticação (qualquer estratégia). */
export const AUTH_SHARED_REQUIRED_PATHS = [
  'src/host/controllers/auth/auth.module.ts',
  'src/host/security/security.module.ts',
  'src/domain/auth/services/iauth.service.ts',
  'src/infra/auth/jwt-token.service.ts',
  'src/domain/dtos/logged-user-info.dto.ts',
  'src/domain/entities/user/user.ts',
  'src/infra/database/migrations/1781281330533-Init.ts',
] as const;

/** Caminhos JWT obrigatórios quando a estratégia inclui login por senha. */
export const JWT_REQUIRED_PATHS = [
  'src/host/controllers/auth/login.controller.ts',
  'src/application/auth/login/login.handler.ts',
  'src/application/auth/refresh-token/refresh-token.handler.ts',
  'src/test/application/login.handler.spec.ts',
] as const;

/** Caminhos OAuth2 obrigatórios quando a estratégia inclui OAuth2. */
export const OAUTH2_REQUIRED_PATHS = [
  'src/application/auth/oauth2',
  'src/host/controllers/oauth2/auth-link.controller.ts',
  'src/application/auth/oauth2/auth-link/auth-link.handler.ts',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/domain/auth/dtos/oauth-user-info.dto.ts',
  'src/domain/auth/dtos/auth-provider-config.dto.ts',
  'src/infra/auth/oauth2-auth.service.ts',
  'src/core/types/auth-provider-config-response.type.ts',
  'src/core/auth/oauth-provider.registry.ts',
  'src/core/auth/parse-oauth2-provider-env.ts',
  'src/test/application/auth-link.handler.spec.ts',
  'src/test/application/exchange-code.handler.spec.ts',
  'src/test/application/scalar-oauth-token.handler.spec.ts',
  'src/test/host/oauth-callback.controller.spec.ts',
  'src/test/infra/oauth2-auth.service.spec.ts',
  'src/test/core/oauth-provider.registry.spec.ts',
] as const;

/** Caminhos proibidos em projeto sem autenticação. */
export const NO_AUTH_FORBIDDEN_PATHS = [
  'src/application/auth',
  'src/host/controllers/oauth2',
  'src/host/security/security.module.ts',
  'src/domain/auth',
  'src/infra/auth',
  'src/core/auth',
  'src/domain/dtos/logged-user-info.dto.ts',
  'src/domain/services/ilogged-user-info.service.ts',
  'src/infra/services/logged-user-info.service.ts',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/host/decorators/restriction-by-profile.decorator.ts',
] as const;

export const JWT_FORBIDDEN_CONTENT = [
  'IOAuth2Service',
  'OAuth2AuthService',
  'OAuthProviderRegistry',
  'OAuthUserInfoDto',
  'AuthProviderConfigDto',
  'parse-oauth2-provider-env',
  'oauth-provider.registry',
  'oauth2-auth.service',
  'OAuthAuthLinkHandler',
  'OAuthExchangeCodeController',
  'ScalarOAuthTokenHandler',
  'OAUTH2_PROVIDERS',
  'OAUTH2_PROVIDER_ENV',
  'parseOAuth2ProviderEnv',
] as const;

export const OAUTH2_LOGIN_FORBIDDEN_CONTENT = [
  'LoginController',
  'LoginHandler',
] as const;

export function resolveAuthProfile(
  selection: AuthStrategySelection,
): AuthProfile {
  if (selection === false || selection.length === 0) {
    return 'none';
  }

  const hasJwt = selection.includes(AuthStrategy.JWT);
  const hasOauth = selection.includes(AuthStrategy.OAUTH2);

  if (hasJwt && hasOauth) {
    return 'jwt+oauth2';
  }

  if (hasJwt) {
    return 'jwt';
  }

  if (hasOauth) {
    return 'oauth2';
  }

  return 'none';
}

export function requiredPathsForProfile(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return [...AUTH_SHARED_REQUIRED_PATHS, ...JWT_REQUIRED_PATHS];
    case 'oauth2':
      return [...AUTH_SHARED_REQUIRED_PATHS, ...OAUTH2_REQUIRED_PATHS];
    case 'jwt+oauth2':
      return [
        ...AUTH_SHARED_REQUIRED_PATHS,
        ...JWT_REQUIRED_PATHS,
        ...OAUTH2_REQUIRED_PATHS,
      ];
  }
}

export function forbiddenPathsForProfile(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return NO_AUTH_FORBIDDEN_PATHS;
    case 'jwt':
      return JWT_ONLY_REMOVE_PATHS;
    case 'oauth2':
      return OAUTH2_ONLY_REMOVE_PATHS;
    case 'jwt+oauth2':
      return [];
  }
}

export function envExampleMustContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return ['JWT_PRIVATE_KEY'];
    case 'oauth2':
      return ['JWT_PRIVATE_KEY', 'OAUTH2_PROVIDERS'];
    case 'jwt+oauth2':
      return ['JWT_PRIVATE_KEY', 'OAUTH2_PROVIDERS'];
  }
}

export function envExampleMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return ['JWT_PRIVATE_KEY', 'OAUTH2_PROVIDERS'];
    case 'jwt':
      return ['OAUTH2_PROVIDERS'];
    case 'oauth2':
      return [];
    case 'jwt+oauth2':
      return [];
  }
}

export function envSourceMustContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return ['JWT_PRIVATE_KEY'];
    case 'oauth2':
      return ['OAUTH2_PROVIDERS', 'parse-oauth2-provider-env'];
    case 'jwt+oauth2':
      return ['JWT_PRIVATE_KEY', 'OAUTH2_PROVIDERS', 'parse-oauth2-provider-env'];
  }
}

export function envSourceMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return [
        'JWT_PRIVATE_KEY',
        'OAUTH2_PROVIDERS',
        'parse-oauth2-provider-env',
        'OAUTH2_PROVIDER_ENV',
      ];
    case 'jwt':
      return ['parse-oauth2-provider-env', 'OAUTH2_PROVIDERS', 'OAUTH2_PROVIDER_ENV'];
    case 'oauth2':
      return [];
    case 'jwt+oauth2':
      return [];
  }
}

export function iauthMustContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return ['IJwtTokenService'];
    case 'oauth2':
      return ['IJwtTokenService', 'IOAuth2Service'];
    case 'jwt+oauth2':
      return ['IJwtTokenService', 'IOAuth2Service'];
  }
}

export function iauthMustNotContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return ['IJwtTokenService', 'IOAuth2Service'];
    case 'jwt':
      return ['IOAuth2Service'];
    case 'oauth2':
      return [];
    case 'jwt+oauth2':
      return [];
  }
}

export function authModuleMustContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return ['LoginController'];
    case 'oauth2':
      return ['OAuthAuthLinkController'];
    case 'jwt+oauth2':
      return ['LoginController', 'OAuthAuthLinkController'];
  }
}

export function authModuleMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return ['LoginController', 'OAuthAuthLinkController'];
    case 'jwt':
      return ['OAuthAuthLinkController'];
    case 'oauth2':
      return ['LoginController'];
    case 'jwt+oauth2':
      return [];
  }
}

export function securityModuleMustContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return [];
    case 'jwt':
      return ['IJwtTokenService'];
    case 'oauth2':
      return ['IJwtTokenService', 'IOAuth2Service', 'OAuthProviderRegistry'];
    case 'jwt+oauth2':
      return ['IJwtTokenService', 'IOAuth2Service', 'OAuthProviderRegistry'];
  }
}

export function securityModuleMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return ['SecurityModule', 'IJwtTokenService', 'IOAuth2Service'];
    case 'jwt':
      return ['IOAuth2Service', 'OAuthProviderRegistry'];
    case 'oauth2':
      return [];
    case 'jwt+oauth2':
      return [];
  }
}

export function cacheConstantsMustContain(profile: AuthProfile): readonly string[] {
  return profile === 'oauth2' || profile === 'jwt+oauth2'
    ? ['OAUTH2_STATE']
    : [];
}

export function cacheConstantsMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  return profile === 'jwt' || profile === 'none' ? ['OAUTH2_STATE'] : [];
}

export function defineDocumentationMustContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return ['apiReference'];
    case 'jwt':
      return ['JWT', 'isProviderRegistered'];
    case 'oauth2':
      return ['buildDocAuthorizations', 'IOAuth2Service'];
    case 'jwt+oauth2':
      return ['JWT', 'IOAuth2Service', 'buildDocAuthorizations'];
  }
}

export function defineDocumentationMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return ['buildDocAuthorizations', 'IOAuth2Service', 'OAuthProviderRegistry'];
    case 'jwt':
      return ['OAuthProviderRegistry', 'IOAuth2Service'];
    case 'oauth2':
      return [];
    case 'jwt+oauth2':
      return [];
  }
}

export function appModuleMustContain(profile: AuthProfile): readonly string[] {
  switch (profile) {
    case 'none':
      return ['InfraModule'];
    case 'jwt':
    case 'oauth2':
    case 'jwt+oauth2':
      return ['SecurityModule', 'AuthModule'];
  }
}

export function appModuleMustNotContain(
  profile: AuthProfile,
): readonly string[] {
  return profile === 'none' ? ['SecurityModule', 'AuthModule'] : [];
}

export function forbiddenContentPatterns(
  profile: AuthProfile,
): readonly string[] {
  switch (profile) {
    case 'none':
      return [...JWT_FORBIDDEN_CONTENT, ...OAUTH2_LOGIN_FORBIDDEN_CONTENT];
    case 'jwt':
      return JWT_FORBIDDEN_CONTENT;
    case 'oauth2':
      return OAUTH2_LOGIN_FORBIDDEN_CONTENT;
    case 'jwt+oauth2':
      return [];
  }
}

/** Perfis válidos para testes parametrizados. */
export const AUTH_PROFILE_MATRIX: readonly AuthProfile[] = [
  'none',
  'jwt',
  'oauth2',
  'jwt+oauth2',
] as const;

export function profileToAuthStrategies(
  profile: AuthProfile,
): AuthStrategySelection {
  switch (profile) {
    case 'none':
      return false;
    case 'jwt':
      return [AuthStrategy.JWT];
    case 'oauth2':
      return [AuthStrategy.OAUTH2];
    case 'jwt+oauth2':
      return [AuthStrategy.JWT, AuthStrategy.OAUTH2];
  }
}
