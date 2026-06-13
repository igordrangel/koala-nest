import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { IssueTokenRequest } from '@/application/auth/issue-token/issue-token.request';
import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Body, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class IssueTokenController implements IController<
  IssueTokenRequest,
  IssueTokenResponse
> {
  constructor(private readonly handler: IssueTokenHandler) {}

  @Post('token')
  @IsPublic()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: IssueTokenResponse })
  handle(@Body() request: IssueTokenRequest): Promise<IssueTokenResponse> {
    return this.handler.handle(request);
  }
}
