import { ReadPersonHandler } from '@/application/person/read/read-person.handler';
import { ReadPersonResponse } from '@/application/person/read/read-person.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { PERSON_ROUTER_CONFIG } from './router.config';

@Controller(PERSON_ROUTER_CONFIG)
export class ReadPersonController implements IController<
  string,
  ReadPersonResponse
> {
  constructor(private readonly handler: ReadPersonHandler) {}

  @Get(':id')
  @ApiOkResponse({ type: ReadPersonResponse })
  async handle(@Param('id') id: string): Promise<ReadPersonResponse> {
    return await this.handler.handle(+id);
  }
}
