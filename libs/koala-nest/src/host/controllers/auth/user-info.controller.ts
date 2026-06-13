import { UserInfoHandler } from '@/application/auth/user-info/user-info.handler';
import { UserInfoResponse } from '@/application/auth/user-info/user-info.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { AUTH_ROUTER_CONFIG } from './router.config';

@Controller(AUTH_ROUTER_CONFIG)
export class UserInfoController implements IController<void, UserInfoResponse> {
  constructor(private readonly handler: UserInfoHandler) {}

  @Get('user-info')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: UserInfoResponse })
  handle(): Promise<UserInfoResponse> {
    return this.handler.handle();
  }
}
