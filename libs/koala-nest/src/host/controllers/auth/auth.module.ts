import { LoginHandler } from '@/application/auth/login/login.handler';
import { RefreshTokenHandler } from '@/application/auth/refresh-token/refresh-token.handler';
import { UserInfoHandler } from '@/application/auth/user-info/user-info.handler';
import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';
import { Module } from '@nestjs/common';
import { ControllerModule } from '../common/controller.module';
import { SecurityModule } from '@/host/security/security.module';
import { LoginController } from './login.controller';
import { UserInfoController } from './user-info.controller';
import { RefreshTokenController } from './refresh-token.controller';
import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';
import { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';
import { OAuthCallbackController } from '../oauth2/oauth-callback.controller';
import { ScalarOAuthTokenController } from '../oauth2/scalar-token.controller';

@Module({
  imports: [ControllerModule, SecurityModule],
  controllers: [
    LoginController,
    UserInfoController,
    RefreshTokenController,
    OAuthAuthLinkController,
    OAuthExchangeCodeController,
    OAuthCallbackController,
    ScalarOAuthTokenController,
  ],
  providers: [
    LoginHandler,
    UserInfoHandler,
    RefreshTokenHandler,
    OAuthAuthLinkHandler,
    OAuthExchangeCodeHandler,
    ScalarOAuthTokenHandler,
  ],
})
export class AuthModule {}
