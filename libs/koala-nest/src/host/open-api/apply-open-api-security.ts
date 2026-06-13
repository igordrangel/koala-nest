import { OpenApiDoc } from './open-api.constants';
import { IS_PUBLIC_KEY } from '@/host/decorators/is-public.decorator';
import { INestApplication, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { OpenAPIObject } from '@nestjs/swagger';

const HTTP_METHOD_BY_REQUEST: Partial<Record<RequestMethod, string>> = {
  [RequestMethod.GET]: 'get',
  [RequestMethod.POST]: 'post',
  [RequestMethod.PUT]: 'put',
  [RequestMethod.DELETE]: 'delete',
  [RequestMethod.PATCH]: 'patch',
  [RequestMethod.OPTIONS]: 'options',
  [RequestMethod.HEAD]: 'head',
};

export function applyOpenApiBearerSecurity(document: OpenAPIObject) {
  document.security = [{ [OpenApiDoc.BEARER_SCHEME]: [] }];
}

export function markPublicRoutesInOpenApiDocument(
  document: OpenAPIObject,
  app: INestApplication,
) {
  const modulesContainer = app.get(ModulesContainer);
  const reflector = app.get(Reflector);

  for (const moduleRef of modulesContainer.values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const { metatype, instance } = wrapper;

      if (!metatype || !instance) {
        continue;
      }

      const controllerPath = Reflect.getMetadata(PATH_METADATA, metatype) ?? '';
      const prototype = Object.getPrototypeOf(instance);

      for (const methodName of Object.getOwnPropertyNames(prototype)) {
        const handler = prototype[methodName];

        if (typeof handler !== 'function') {
          continue;
        }

        const isPublic = reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          handler,
          metatype,
        ]);

        if (!isPublic) {
          continue;
        }

        const methodPath = Reflect.getMetadata(PATH_METADATA, handler) ?? '';
        const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler) as
          | RequestMethod
          | undefined;

        if (requestMethod === undefined) {
          continue;
        }

        const httpMethod = HTTP_METHOD_BY_REQUEST[requestMethod];

        if (!httpMethod) {
          continue;
        }

        const openApiPath = buildOpenApiPath(controllerPath, methodPath);
        const operation = document.paths?.[openApiPath]?.[httpMethod];

        if (operation) {
          operation.security = [];
        }
      }
    }
  }
}

export function buildOpenApiPath(controllerPath: string, methodPath: string) {
  const joined = [controllerPath, methodPath]
    .filter((segment) => segment !== undefined && segment !== '')
    .join('/')
    .replace(/\/+/g, '/');

  const withLeadingSlash = joined.startsWith('/') ? joined : `/${joined}`;

  return (
    withLeadingSlash.replace(/:([A-Za-z0-9_]+)/g, '{$1}').replace(/\/$/, '') ||
    '/'
  );
}
