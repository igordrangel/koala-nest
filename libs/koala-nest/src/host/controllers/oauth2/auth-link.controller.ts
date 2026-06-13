import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthAuthLinkRequest } from '@/application/auth/oauth2/auth-link/auth-link.request';
import { OAuthAuthLinkResponse } from '@/application/auth/oauth2/auth-link/auth-link.response';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { Controller } from '@/host/decorators/controller.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { OAUTH_ROUTER_CONFIG } from './router.config';

@Controller(OAUTH_ROUTER_CONFIG)
export class OAuthAuthLinkController implements IController<
  OAuthAuthLinkRequest,
  OAuthAuthLinkResponse
> {
  constructor(private readonly handler: OAuthAuthLinkHandler) {}

  @Post('auth-link')
  @IsPublic()
  @ApiExcludeEndpointDiffDevelop()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OAuthAuthLinkResponse })
  handle(
    @Body() request: OAuthAuthLinkRequest,
  ): Promise<OAuthAuthLinkResponse> {
    return this.handler.handle(request);
  }
}
