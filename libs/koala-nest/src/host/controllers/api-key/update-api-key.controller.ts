import { UpdateApiKeyHandler } from '@/application/api-key/update/update-api-key.handler';
import { UpdateApiKeyRequest } from '@/application/api-key/update/update-api-key.request';
import { Controller } from '@/host/decorators/controller.decorator';
import { Body, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { API_KEY_ROUTER_CONFIG } from './router.config';

@Controller(API_KEY_ROUTER_CONFIG)
export class UpdateApiKeyController implements IController<
  UpdateApiKeyRequest,
  void
> {
  constructor(private readonly handler: UpdateApiKeyHandler) {}

  @Put()
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  handle(@Body() request: UpdateApiKeyRequest): Promise<void> {
    return this.handler.handle(request);
  }
}
