import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiOkResponse } from '@nestjs/swagger';

/** Rota interna do Scalar — não aparece na documentação OpenAPI. */
export const ScalarTokenEndpoint = () =>
  applyDecorators(
    Post('scalar-token'),
    IsPublic(),
    HttpCode(HttpStatus.OK),
    ApiExcludeEndpoint(),
    ApiOkResponse({ type: AuthTokenResponse }),
  );
