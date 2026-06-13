import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { ScalarTokenEndpoint } from '@/host/decorators/scalar-token-endpoint.decorator';
import { Controller } from '@/host/decorators/controller.decorator';
import { Body } from '@nestjs/common';
import { OAUTH_ROUTER_CONFIG } from './router.config';

@Controller(OAUTH_ROUTER_CONFIG)
export class ScalarOAuthTokenController {
  constructor(private readonly handler: ScalarOAuthTokenHandler) {}

  @ScalarTokenEndpoint()
  handle(@Body() body: Record<string, string>): Promise<AuthTokenResponse> {
    return this.handler.handle(body);
  }
}
