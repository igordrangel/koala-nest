import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthAuthLinkRequest } from '@/application/auth/oauth2/auth-link/auth-link.request';
import { OAuthAuthLinkResponse } from '@/application/auth/oauth2/auth-link/auth-link.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import {
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
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
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: OAuthAuthLinkResponse })
  handle(
    @Body() request: OAuthAuthLinkRequest,
  ): Promise<OAuthAuthLinkResponse> {
    return this.handler.handle(request);
  }

  @Get('auth-link/redirect')
  @IsPublic()
  @ApiQuery({ name: 'provider', required: true })
  @ApiQuery({ name: 'redirectUri', required: false })
  async redirect(
    @Query('provider') provider: string,
    @Query('redirectUri') redirectUri: string | undefined,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.handler.handle({ provider, redirectUri });
    response.redirect(result.url);
  }
}
