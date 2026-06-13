import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { ILoggedUserInfoService } from '@/domain/services/ilogged-user-info.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserInfoResponse } from './user-info.response';

@Injectable()
export class UserInfoHandler extends RequestHandlerBase<
  void,
  UserInfoResponse
> {
  constructor(private readonly loggedUserInfo: ILoggedUserInfoService) {
    super();
  }

  handle(): Promise<UserInfoResponse> {
    const user = this.loggedUserInfo.getUser();

    if (!user.name || !user.profile || !user.email || !user.login) {
      throw new NotFoundException('User not found');
    }

    return Promise.resolve({
      id: user.sub,
      name: user.name,
      email: user.email,
      login: user.login,
      profile: user.profile,
    });
  }
}
