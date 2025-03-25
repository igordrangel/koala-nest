import { ReadPersonHandler } from '@/application/person/read/read-person.handler'
import { ReadPersonResponse } from '@/application/person/read/read-person.response'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@ApiTags(PERSON_ROUTER_CONFIG.tag)
@Controller(PERSON_ROUTER_CONFIG.group)
export class ReadPersonController
  implements IController<null, ReadPersonResponse, string>
{
  constructor(private readonly handler: ReadPersonHandler) {}

  @Get(':id')
  @ApiOkResponse({ type: ReadPersonResponse })
  async handle(_, @Param('id') id: string): Promise<ReadPersonResponse> {
    const response = await this.handler.handle(+id)

    if (response.isFailure()) {
      throw response.value
    }

    return response.value
  }
}
