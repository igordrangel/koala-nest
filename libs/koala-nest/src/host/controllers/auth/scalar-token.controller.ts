import { ScalarPasswordTokenHandler } from '@/application/auth/scalar-token/scalar-password-token.handler';
import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { ScalarTokenEndpoint } from '@/host/decorators/scalar-token-endpoint.decorator';
import { Controller } from '@/host/decorators/controller.decorator';
import { Body } from '@nestjs/common';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class ScalarPasswordTokenController {
  constructor(private readonly handler: ScalarPasswordTokenHandler) {}

  @ScalarTokenEndpoint()
  handle(@Body() body: Record<string, string>): Promise<IssueTokenResponse> {
    return this.handler.handle(body);
  }
}
