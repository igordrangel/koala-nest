import { userToJwtClaims } from '@/application/auth/common/user-claims';
import { AuthTokenResponse } from '@/application/auth/common/auth-token.response';
import { assertUserIsActive } from '@/core/auth/assert-user-active';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { hashPassword } from '@/core/utils/hash-password';
import { nameToLogin } from '@/core/utils/name-to-login';
import { User } from '@/domain/entities/user/user';
import { UserStatus } from '@/domain/entities/user/enums/user-status.enum';
import {
  IOAuth2Service,
  IJwtTokenService,
} from '@/domain/auth/services/iauth.service';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { Injectable } from '@nestjs/common';
import { randomString } from '@koalarx/utils';
import { OAuthExchangeCodeRequest } from './exchange-code.request';
import { OAuthExchangeCodeValidator } from './exchange-code.validator';

@Injectable()
export class OAuthExchangeCodeHandler extends RequestHandlerBase<
  OAuthExchangeCodeRequest,
  AuthTokenResponse
> {
  constructor(
    private readonly oauth2Service: IOAuth2Service,
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: IJwtTokenService,
  ) {
    super();
  }

  async handle(request: OAuthExchangeCodeRequest): Promise<AuthTokenResponse> {
    const data = new OAuthExchangeCodeValidator(request).validate();
    const userInfo = data.state
      ? await this.oauth2Service.exchangeCode(
          data.provider,
          data.code,
          data.state,
          data.redirectUri,
        )
      : await this.oauth2Service.exchangeScalarCode(
          data.provider,
          data.code,
          data.redirectUri,
        );

    let user = await this.userRepository.getByEmail(userInfo.email);

    if (!user) {
      user = new User();
      user.email = userInfo.email;
      user.name =
        userInfo.name ?? userInfo.email.split('@')[0] ?? userInfo.login;
      user.login = await nameToLogin(user.name, this.userRepository);
      user.profile = userInfo.profile ?? AuthProfile.user;
      user.status = UserStatus.active;
      user.password = await hashPassword(
        randomString(16, {
          lowercase: true,
          uppercase: true,
          numbers: true,
          specialCharacters: true,
        }),
      );
      user = await this.userRepository.save(user);
    }

    assertUserIsActive(user);

    return this.jwtTokenService.signTokenPair(userToJwtClaims(user));
  }
}
