import { DeletePersonHandler } from '@/domain/person/use-cases/delete/delete-person.handler'
import { IController } from '@koalarx/nest/common/controllers/base.controller'
import { Controller, Delete, HttpCode, HttpStatus, Param } from '@nestjs/common'
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { PERSON_ROUTER_CONFIG } from './router.config'

@ApiTags(PERSON_ROUTER_CONFIG.tag)
@Controller(PERSON_ROUTER_CONFIG.group)
export class DeletePersonController implements IController<null, void, string> {
  constructor(private readonly handler: DeletePersonHandler) {}

  @Delete(':id')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(_, @Param('id') id: string): Promise<void> {
    const response = await this.handler.handle(+id)

    if (response.isFailure()) {
      throw response.value
    }
  }
}
