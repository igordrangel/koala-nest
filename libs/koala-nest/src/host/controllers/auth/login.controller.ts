import { LoginHandler } from '@/application/auth/login/login.handler';
import { LoginRequest } from '@/application/auth/login/login.request';
import { LoginResponse } from '@/application/auth/login/login.response';
import { AuthHttp } from '@/core/auth/auth.constants';
import { Controller } from '@/host/decorators/controller.decorator';
import { ApiExcludeEndpointDiffDevelop } from '@/host/decorators/api-exclude-endpoint-diff-develop.decorator';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Body, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { IController } from '../common/controller.base';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class LoginController implements IController<
  LoginRequest,
  LoginResponse
> {
  constructor(private readonly handler: LoginHandler) {}

  @Post('login')
  @IsPublic()
  @ApiExcludeEndpointDiffDevelop()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LoginResponse })
  async handle(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponse> {
    const tokens = await this.handler.handle(request);

    // Cross-site XHR (front ≠ API) bloqueia Set-Cookie com SameSite=Lax;
    // None+Secure é obrigatório. Lax basta em localhost (same-site).
    const isLocalhost = process.env.API_HOST?.includes('localhost') === true;

    response.cookie(AuthHttp.REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      path: '/',
      secure: !isLocalhost,
      sameSite: isLocalhost ? 'strict' : 'none',
      httpOnly: true,
    });

    return tokens;
  }
}
