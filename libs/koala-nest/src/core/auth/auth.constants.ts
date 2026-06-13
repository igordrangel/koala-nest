/** Tipos de token JWT emitidos pela API. */
export enum JwtTokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

/** Valores usados na camada HTTP de autenticação. */
export const AuthHttp = {
  BEARER_PREFIX: 'Bearer ',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
  JWT_ALGORITHM: 'RS256',
} as const;

/** Nomes de claims JWT customizados. */
export const JwtClaimKey = {
  TOKEN_TYPE: 'tokenType',
  PROFILE: 'profile',
} as const;
