import { ReadManyPersonHandler } from '@/domain/person/use-cases/read-many/read-many-person.handler'
import { ReadManyPersonRequest } from '@/domain/person/use-cases/read-many/read-many-person.request'
import { ReadManyPersonResponse } from '@/domain/person/use-cases/read-many/read-many-person.response'
import { IController } from '@koalarx/nest/common/controllers/base.controller'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@ApiTags(PERSON_ROUTER_CONFIG.tag)
@Controller(PERSON_ROUTER_CONFIG.group)
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
