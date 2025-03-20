import { ResourceNotFoundError } from '@koalarx/nest/common/errors/resource-not-found.error'
import { RequestHandlerBase } from '@koalarx/nest/common/mediator/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/common/mediator/request-result'
import { Injectable } from '@nestjs/common'
import { Mapper } from 'automapper-core'
import { InjectMapper } from 'automapper-nestjs'
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
    @InjectMapper()
    private readonly mapper: Mapper,
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
    personInBd.phones.update(person.phones.toArray())

    await this.repository.save(personInBd)

    return ok(null)
  }
}
