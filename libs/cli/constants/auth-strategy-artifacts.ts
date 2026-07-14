/**
 * Inventário central de artefatos por estratégia de auth.
 * Usado na instalação, poda e validação automática (evita resquícios OAuth2 em JWT-only).
 */

/** Pastas/arquivos removidos quando apenas JWT está ativo. */
export const JWT_ONLY_REMOVE_PATHS = [
  'src/application/auth/oauth2',
  'src/host/controllers/oauth2',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/domain/auth/dtos/oauth-user-info.dto.ts',
  'src/domain/auth/dtos/auth-provider-config.dto.ts',
  'src/infra/auth/oauth2-auth.service.ts',
  'src/core/types/auth-provider-config-response.type.ts',
  'src/core/auth/oauth-provider.registry.ts',
  'src/core/auth/parse-oauth2-provider-env.ts',
  'src/test/application/exchange-code.handler.spec.ts',
  'src/test/application/scalar-oauth-token.handler.spec.ts',
  'src/test/application/auth-link.handler.spec.ts',
  'src/test/host/oauth-callback.controller.spec.ts',
  'src/test/infra/oauth2-auth.service.spec.ts',
  'src/test/core/oauth-provider.registry.spec.ts',
] as const;

/** Reinstalados ao adicionar OAuth2 incrementalmente. */
export const OAUTH2_INSTALL_PATHS = [
  'src/application/auth/oauth2',
  'src/host/controllers/oauth2',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/domain/auth/dtos/oauth-user-info.dto.ts',
  'src/domain/auth/dtos/auth-provider-config.dto.ts',
  'src/infra/auth/oauth2-auth.service.ts',
  'src/core/types/auth-provider-config-response.type.ts',
  'src/core/auth/oauth-provider.registry.ts',
  'src/core/auth/parse-oauth2-provider-env.ts',
  'src/test/application/exchange-code.handler.spec.ts',
  'src/test/application/scalar-oauth-token.handler.spec.ts',
  'src/test/application/auth-link.handler.spec.ts',
  'src/test/host/oauth-callback.controller.spec.ts',
  'src/test/infra/oauth2-auth.service.spec.ts',
  'src/test/core/oauth-provider.registry.spec.ts',
  'src/test/core/env.spec.ts',
] as const;

/** Artefatos da estratégia API Key (aditiva a JWT/OAuth2). */
export const API_KEY_INSTALL_PATHS = [
  'src/application/api-key',
  'src/host/controllers/api-key',
  'src/domain/entities/api-key',
  'src/domain/repositories/iapi-key.repository.ts',
  'src/infra/repositories/api-key.repository.ts',
  'src/infra/auth/api-key-authorization.service.ts',
  'src/host/security/strategies/api-key.strategy.ts',
  'src/core/utils/capture-apikey-on-request.ts',
  'src/core/utils/match-api-key-domain-origin.ts',
  'src/application/mapping/api-key.mapper.ts',
  'src/infra/database/migrations/1781281330534-CreateApiKey.ts',
] as const;

export const API_KEY_SUBNET_PATH =
  'src/core/utils/internal-subnet-validator.ts' as const;

/** Removidos quando apenas OAuth2 está ativo (sem login por senha). */
export const OAUTH2_ONLY_REMOVE_PATHS = [
  'src/application/auth/login',
  'src/host/controllers/auth/login.controller.ts',
  'src/test/application/login.handler.spec.ts',
] as const;

/** Padrões proibidos em arquivos `.ts` de projetos JWT-only. */
export const JWT_ONLY_FORBIDDEN_CONTENT = [
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
