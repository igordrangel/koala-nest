import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { OAuthExchangeCodeRequest } from '@/application/auth/oauth2/exchange-code/exchange-code.request';
import { OAuthExchangeCodeResponse } from '@/application/auth/oauth2/exchange-code/exchange-code.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { OAUTH_ROUTER_CONFIG } from './router.config';

@Controller(OAUTH_ROUTER_CONFIG)
export class OAuthExchangeCodeController implements IController<
  OAuthExchangeCodeRequest,
  OAuthExchangeCodeResponse
> {
  constructor(private readonly handler: OAuthExchangeCodeHandler) {}

  @Post('token')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OAuthExchangeCodeResponse })
  handle(
    @Body() request: OAuthExchangeCodeRequest,
  ): Promise<OAuthExchangeCodeResponse> {
    return this.handler.handle(request);
  }
}
