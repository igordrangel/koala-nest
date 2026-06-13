import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IOAuth2Service } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { OAuthAuthLinkRequest } from './auth-link.request';
import { OAuthAuthLinkResponse } from './auth-link.response';
import { OAuthAuthLinkValidator } from './auth-link.validator';

@Injectable()
export class OAuthAuthLinkHandler extends RequestHandlerBase<
  OAuthAuthLinkRequest,
  OAuthAuthLinkResponse
> {
  constructor(private readonly oauth2Service: IOAuth2Service) {
    super();
  }

  async handle(request: OAuthAuthLinkRequest): Promise<OAuthAuthLinkResponse> {
    const data = new OAuthAuthLinkValidator(request).validate();

    return {
      url: await this.oauth2Service.authLink(data.provider, data.redirectUri),
    };
  }
}
