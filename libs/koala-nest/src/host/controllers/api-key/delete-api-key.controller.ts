import { DeleteApiKeyHandler } from '@/application/api-key/delete/delete-api-key.handler';
import { Controller } from '@/host/decorators/controller.decorator';
import { Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { API_KEY_ROUTER_CONFIG } from './router.config';

@Controller(API_KEY_ROUTER_CONFIG)
export class DeleteApiKeyController implements IController<string, void> {
  constructor(private readonly handler: DeleteApiKeyHandler) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse()
  handle(@Param('id') id: string): Promise<void> {
    return this.handler.handle(id);
  }
}
