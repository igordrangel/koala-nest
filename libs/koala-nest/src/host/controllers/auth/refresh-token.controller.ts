import { RefreshTokenHandler } from '@/application/auth/refresh-token/refresh-token.handler';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { Controller } from '@/host/decorators/controller.decorator';
import { HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class RefreshTokenController implements IController<
  void,
  AuthTokenResponse
> {
  constructor(private readonly handler: RefreshTokenHandler) {}

  @Post('refresh')
  @ApiExcludeEndpointDiffDevelop()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokenResponse })
  handle(): Promise<AuthTokenResponse> {
    return this.handler.handle();
  }
}
