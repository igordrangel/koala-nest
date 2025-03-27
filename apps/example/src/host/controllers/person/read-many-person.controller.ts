import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler'
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request'
import { ReadManyPersonResponse } from '@/application/person/read-many/read-many-person.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller } from '@koalarx/nest/core/controllers/controller.decorator'
import { Get, Query } from '@nestjs/common'
import { ApiOkResponse } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@Controller(PERSON_ROUTER_CONFIG)
export class ReadManyPersonController
  implements IController<ReadManyPersonRequest, ReadManyPersonResponse>
{
  constructor(private readonly handler: ReadManyPersonHandler) {}

  @Get()
  @ApiOkResponse({ type: ReadManyPersonResponse })
  async handle(
    @Query() query: ReadManyPersonRequest,
  ): Promise<ReadManyPersonResponse> {
    const response = await this.handler.handle(query)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
