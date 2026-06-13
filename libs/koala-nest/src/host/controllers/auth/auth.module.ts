import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { RefreshTokenHandler } from '@/application/auth/refresh-token/refresh-token.handler';
import { ScalarPasswordTokenHandler } from '@/application/auth/scalar-token/scalar-password-token.handler';
import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { Module } from '@nestjs/common';
import { ControllerModule } from '../common/controller.module';
import { SecurityModule } from '@/host/security/security.module';
import { IssueTokenController } from './issue-token.controller';
import { RefreshTokenController } from './refresh-token.controller';
import { ScalarPasswordTokenController } from './scalar-token.controller';
import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';
import { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';
import { ScalarOAuthTokenController } from '../oauth2/scalar-token.controller';

@Module({
  imports: [ControllerModule, SecurityModule],
  controllers: [
    IssueTokenController,
    RefreshTokenController,
    ScalarPasswordTokenController,
    OAuthAuthLinkController,
    OAuthExchangeCodeController,
    ScalarOAuthTokenController,
  ],
  providers: [
    IssueTokenHandler,
    RefreshTokenHandler,
    ScalarPasswordTokenHandler,
    OAuthAuthLinkHandler,
    OAuthExchangeCodeHandler,
    ScalarOAuthTokenHandler,
  ],
})
export class AuthModule {}
