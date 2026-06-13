import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { jwtClaimsSchema } from '@/core/auth/jwt-claims';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { Injectable } from '@nestjs/common';
import { IssueTokenResponse } from '../issue-token/issue-token.response';

@Injectable()
export class RefreshTokenHandler extends RequestHandlerBase<
  void,
  IssueTokenResponse
> {
  constructor(
    private readonly jwtTokenService: IJwtTokenService,
    private readonly loggedUserInfo: ILoggedUserInfoService,
  ) {
    super();
  }

  async handle(): Promise<IssueTokenResponse> {
    const user = this.loggedUserInfo.getUser();
    const claims = jwtClaimsSchema.parse({
      sub: user.sub,
      profile: user.profile,
      login: user.login,
      email: user.email,
    });

    return this.jwtTokenService.signTokenPair(claims);
  }
}
