import { ReadManyApiKeyHandler } from '@/application/api-key/read-many/read-many-api-key.handler';
import { ReadManyApiKeyResponse } from '@/application/api-key/read-many/read-many-api-key.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { API_KEY_ROUTER_CONFIG } from './router.config';

@Controller(API_KEY_ROUTER_CONFIG)
export class ReadManyApiKeyController implements IController<
  void,
  ReadManyApiKeyResponse
> {
  constructor(private readonly handler: ReadManyApiKeyHandler) {}

  @Get()
  @ApiOkResponse({ type: ReadManyApiKeyResponse })
  handle(): Promise<ReadManyApiKeyResponse> {
    return this.handler.handle();
  }
}
