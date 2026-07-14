import { ReadApiKeyHandler } from '@/application/api-key/read/read-api-key.handler';
import { ReadApiKeyResponse } from '@/application/api-key/read/read-api-key.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { API_KEY_ROUTER_CONFIG } from './router.config';

@Controller(API_KEY_ROUTER_CONFIG)
export class ReadApiKeyController implements IController<
  string,
  ReadApiKeyResponse
> {
  constructor(private readonly handler: ReadApiKeyHandler) {}

  @Get(':id')
  @ApiOkResponse({ type: ReadApiKeyResponse })
  handle(@Param('id') id: string): Promise<ReadApiKeyResponse> {
    return this.handler.handle(id);
  }
}
