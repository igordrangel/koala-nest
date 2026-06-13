import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IOAuth2Service } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { OAuthExchangeCodeRequest } from './exchange-code.request';
import { OAuthExchangeCodeResponse } from './exchange-code.response';
import { OAuthExchangeCodeValidator } from './exchange-code.validator';

@Injectable()
export class OAuthExchangeCodeHandler extends RequestHandlerBase<
  OAuthExchangeCodeRequest,
  OAuthExchangeCodeResponse
> {
  constructor(private readonly oauth2Service: IOAuth2Service) {
    super();
  }

  async handle(
    request: OAuthExchangeCodeRequest,
  ): Promise<OAuthExchangeCodeResponse> {
    const data = new OAuthExchangeCodeValidator(request).validate();
    const userInfo = await this.oauth2Service.exchangeCode(
      data.provider,
      data.code,
      data.state,
      data.redirectUri,
    );

    return {
      login: userInfo.login,
      email: userInfo.email,
      name: userInfo.name,
      profile: userInfo.profile,
    };
  }
}
