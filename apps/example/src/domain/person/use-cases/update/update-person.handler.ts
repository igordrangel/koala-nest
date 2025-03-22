import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { Person } from '../../entities/person'
import { IPersonRepository } from '../../repositories/iperson.repository'
import { UpdatePersonRequest } from './update-person.request'
import { UpdatePersonValidator } from './update-person.validator'

type UpdatePersonHandleRequest = {
  id: number
  data: UpdatePersonRequest
}

@Injectable()
export class UpdatePersonHandler extends RequestHandlerBase<
  UpdatePersonHandleRequest,
  RequestResult<ResourceNotFoundError, null>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle({
    id,
    data,
  }: UpdatePersonHandleRequest): Promise<RequestResult<Error, null>> {
    const personInBd = await this.repository.read(id)

    if (!personInBd) {
      return failure(new ResourceNotFoundError('Person'))
    }

    const person = this.mapper.map(
      new UpdatePersonValidator(data).validate(),
      UpdatePersonRequest,
      Person,
    )

    personInBd.name = person.name
    personInBd.active = person.active
    personInBd.phones.update(person.phones.toArray())

    await this.repository.save(personInBd)

    return ok(null)
  }
}
