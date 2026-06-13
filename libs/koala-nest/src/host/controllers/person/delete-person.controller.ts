import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { Controller } from '@/host/decorators/controller.decorator';
import { Delete, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { PERSON_ROUTER_CONFIG } from './router.config';

@Controller(PERSON_ROUTER_CONFIG)
export class DeletePersonController implements IController<string, void> {
  constructor(private readonly handler: DeletePersonHandler) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOkResponse()
  handle(@Param('id') id: string): Promise<void> {
    return this.handler.handle(+id);
  }
}
