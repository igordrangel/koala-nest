import { userToJwtClaims } from '@/application/auth/common/user-claims';
import { assertUserIsActive } from '@/core/auth/assert-user-active';
import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { LoginRequest } from './login.request';
import { LoginResponse } from './login.response';
import { LoginValidator } from './login.validator';

@Injectable()
export class LoginHandler extends RequestHandlerBase<
  LoginRequest,
  LoginResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtTokenService: IJwtTokenService,
  ) {
    super();
  }

  async handle(request: LoginRequest): Promise<LoginResponse> {
    const credentials = new LoginValidator(request).validate();
    const user = await this.userRepository.getByEmail(credentials.username);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    assertUserIsActive(user);

    const isPasswordValid = await compare(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.jwtTokenService.signTokenPair(userToJwtClaims(user));
  }
}
