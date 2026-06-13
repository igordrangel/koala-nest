import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RefreshTokenHandler extends RequestHandlerBase<
  void,
  AuthTokenResponse
> {
  constructor(
    private readonly jwtTokenService: IJwtTokenService,
    private readonly loggedUserInfo: ILoggedUserInfoService,
  ) {
    super();
  }

  handle(): Promise<AuthTokenResponse> {
    const user = this.loggedUserInfo.getUser();

    return Promise.resolve(
      this.jwtTokenService.signTokenPair({ sub: user.sub }),
    );
  }
}
