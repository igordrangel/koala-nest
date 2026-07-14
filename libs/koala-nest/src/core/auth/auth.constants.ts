/** Valores usados na camada HTTP de autenticação. */
export const AuthHttp = {
  BEARER_PREFIX: 'Bearer ',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
  JWT_ALGORITHM: 'RS256',
  API_KEY_HEADER: 'ApiKey',
  API_KEY_TOKEN_TYPE: 'api-key',
} as const;
