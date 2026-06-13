import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { applyDecorators, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

export const ScalarTokenEndpoint = () =>
  applyDecorators(
    Post('scalar-token'),
    IsPublic(),
    HttpCode(HttpStatus.OK),
    ApiExcludeEndpointDiffDevelop(),
    ApiOkResponse({ type: IssueTokenResponse }),
  );
