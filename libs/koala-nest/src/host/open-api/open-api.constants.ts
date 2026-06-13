/** Endpoints e esquemas da documentação OpenAPI / Scalar. */
export const OpenApiDoc = {
  ENDPOINT: '/doc',
  BEARER_SCHEME: 'bearer',
  JWT_SCHEME: 'JWT',
  ACCESS_TOKEN_FIELD: 'accessToken',
} as const;

export const OpenApiMetadata = {
  TITLE: 'KoalaNest',
  DESCRIPTION: 'KoalaNest API',
} as const;
