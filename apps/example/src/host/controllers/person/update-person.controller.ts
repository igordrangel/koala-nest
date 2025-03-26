import { UpdatePersonHandler } from '@/application/person/update/update-person.handler'
import { UpdatePersonRequest } from '@/application/person/update/update-person.request'
import { IController } from '@koalarx/nest/core/controllers/base.controller'
import { Body, Controller, Param, Put } from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@ApiTags(PERSON_ROUTER_CONFIG.tag)
@Controller(PERSON_ROUTER_CONFIG.group)
export class UpdatePersonController
  implements IController<UpdatePersonRequest, void>
{
  constructor(private readonly handler: UpdatePersonHandler) {}

  @Put(':id')
  @ApiOkResponse()
  async handle(
    @Body() request: UpdatePersonRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const response = await this.handler.handle({
      id: +id,
      data: request,
    })

    if (response.isFailure()) {
      throw response.value
    }
  }
}
