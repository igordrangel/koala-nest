import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { Module } from '@nestjs/common';
import { ControllerModule } from '../common/controller.module';
import { SecurityModule } from '@/host/security/security.module';
import { IssueTokenController } from './issue-token.controller';
import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';
import { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';

@Module({
  imports: [ControllerModule, SecurityModule],
  controllers: [
    IssueTokenController,
    OAuthAuthLinkController,
    OAuthExchangeCodeController,
  ],
  providers: [
    IssueTokenHandler,
    OAuthAuthLinkHandler,
    OAuthExchangeCodeHandler,
  ],
})
export class AuthModule {}
