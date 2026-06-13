import { applyDecorators, SetMetadata } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marcador interno lido pelo Swagger e removido em `syncIsPublicRoutesInOpenApi`. */
export const SWAGGER_PUBLIC_ROUTE = 'public';

const OPENAPI_HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
  'trace',
]);

/**
 * Libera a rota na API e na documentação OpenAPI (sem cadeado no Scalar).
 *
 * O Nest não aplica `security: []` via decorator quando há security global;
 * por isso o metadata `swagger/apiSecurity` é sincronizado no documento gerado.
 */
export const IsPublic = () =>
  applyDecorators(
    SetMetadata(IS_PUBLIC_KEY, true),
    SetMetadata('swagger/apiSecurity', [SWAGGER_PUBLIC_ROUTE]),
  );

export function syncIsPublicRoutesInOpenApi(document: OpenAPIObject) {
  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!OPENAPI_HTTP_METHODS.has(method) || !operation?.security) {
        continue;
      }

      const isPublicRoute = operation.security.some((requirement) =>
        requirement === SWAGGER_PUBLIC_ROUTE
          ? true
          : typeof requirement === 'object' &&
            SWAGGER_PUBLIC_ROUTE in requirement,
      );

      if (isPublicRoute) {
        operation.security = [];
      }
    }
  }
}

/** Aplica os esquemas de auth em cada operação protegida (Scalar exige `operation.security` explícito). */
export function applyAuthSecurityToProtectedRoutes(
  document: OpenAPIObject,
  schemeNames: string[],
) {
  if (schemeNames.length === 0) {
    return;
  }

  const securityRequirements = schemeNames.map((name) => ({ [name]: [] }));

  document.security = securityRequirements;

  for (const pathItem of Object.values(document.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!OPENAPI_HTTP_METHODS.has(method) || !operation) {
        continue;
      }

      if (
        Array.isArray(operation.security) &&
        operation.security.length === 0
      ) {
        continue;
      }

      operation.security = securityRequirements;
    }
  }
}
