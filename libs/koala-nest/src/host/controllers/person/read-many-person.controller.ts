import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request';
import { ReadManyPersonResponse } from '@/application/person/read-many/read-many-person.response';
import { Controller } from '@/host/decorators/controller.decorator';
import { Get, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { IController } from '../common/controller.base';
import { PERSON_ROUTER_CONFIG } from './router.config';

@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController implements IController<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(private readonly handler: ReadManyPersonHandler) {}

  @Get()
  @ApiOkResponse({ type: ReadManyPersonResponse })
  async handle(
    @Query() query: ReadManyPersonRequest,
  ): Promise<ReadManyPersonResponse> {
    return await this.handler.handle(query);
  }
}
