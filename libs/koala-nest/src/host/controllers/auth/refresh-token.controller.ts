import { RefreshTokenHandler } from '@/application/auth/refresh-token/refresh-token.handler';
import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class RefreshTokenController implements IController<void, IssueTokenResponse> {
  constructor(private readonly handler: RefreshTokenHandler) {}

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: IssueTokenResponse })
  handle(): Promise<IssueTokenResponse> {
    return this.handler.handle();
  }
}
