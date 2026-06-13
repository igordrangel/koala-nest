import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { Controller } from '@/host/decorators/controller.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { OAUTH_ROUTER_CONFIG } from './router.config';
import { OAuthExchangeCodeRequest } from '@/application/auth/oauth2/exchange-code/exchange-code.request';

@Controller(OAUTH_ROUTER_CONFIG)
export class OAuthExchangeCodeController implements IController<
  OAuthExchangeCodeRequest,
  AuthTokenResponse
> {
  constructor(private readonly handler: OAuthExchangeCodeHandler) {}

  @Post('token')
  @IsPublic()
  @ApiExcludeEndpointDiffDevelop()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokenResponse })
  handle(
    @Body() request: OAuthExchangeCodeRequest,
  ): Promise<AuthTokenResponse> {
    return this.handler.handle(request);
  }
}
