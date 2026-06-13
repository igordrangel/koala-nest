import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { jwtClaimsSchema } from '@/core/auth/jwt-claims';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { IssueTokenRequest } from './issue-token.request';
import { IssueTokenResponse } from './issue-token.response';
import { IssueTokenValidator } from './issue-token.validator';

@Injectable()
export class IssueTokenHandler extends RequestHandlerBase<
  IssueTokenRequest,
  IssueTokenResponse
> {
  constructor(private readonly jwtTokenService: IJwtTokenService) {
    super();
  }

  handle(request: IssueTokenRequest): IssueTokenResponse {
    const claims = jwtClaimsSchema.parse(
      new IssueTokenValidator(request).validate(),
    );

    return this.jwtTokenService.signTokenPair(claims);
  }
}
