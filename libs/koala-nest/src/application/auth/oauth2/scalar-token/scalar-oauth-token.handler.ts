import { IssueTokenHandler } from '@/application/auth/issue-token/issue-token.handler';
import { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IssueTokenResponse } from '@/application/auth/issue-token/issue-token.response';
import { ScalarTokenBody } from '@/application/auth/scalar-token/scalar-token.types';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ScalarOAuthTokenHandler extends RequestHandlerBase<
  ScalarTokenBody,
  IssueTokenResponse
> {
  constructor(
    private readonly exchangeCode: OAuthExchangeCodeHandler,
    private readonly issueToken: IssueTokenHandler,
  ) {
    super();
  }

  async handle(body: ScalarTokenBody): Promise<IssueTokenResponse> {
    const provider = body.provider;
    const code = body.code ?? body.ssoCode;
    const state = body.state;
    const redirectUri = body.redirect_uri ?? body.redirectUri;

    if (!provider?.trim() || !code?.trim() || !state?.trim()) {
      throw new BadRequestException(
        'Campos provider, code e state são obrigatórios',
      );
    }

    const userInfo = await this.exchangeCode.handle({
      provider: provider.trim(),
      code: code.trim(),
      state: state.trim(),
      redirectUri,
    });

    return this.issueToken.handle({
      sub: userInfo.email || userInfo.login,
      profile: userInfo.profile,
      email: userInfo.email,
      login: userInfo.login,
    });
  }
}
