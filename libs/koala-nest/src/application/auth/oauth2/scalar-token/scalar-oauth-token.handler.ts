import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { ScalarTokenBody } from './scalar-token.types';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ScalarOAuthTokenHandler extends RequestHandlerBase<
  ScalarTokenBody,
  AuthTokenResponse
> {
  constructor(private readonly exchangeCode: OAuthExchangeCodeHandler) {
    super();
  }

  async handle(body: ScalarTokenBody): Promise<AuthTokenResponse> {
    const provider = body.provider?.trim();
    const code = (body.code ?? body.ssoCode)?.trim();
    const state = body.state?.trim();
    const redirectUri = body.redirect_uri ?? body.redirectUri;

    if (!provider || !code) {
      throw new BadRequestException(
        'Campos provider e code (ou ssoCode) são obrigatórios',
      );
    }

    return this.exchangeCode.handle({
      provider,
      code,
      state: state || undefined,
      redirectUri,
    });
  }
}
