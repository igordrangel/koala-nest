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
import { ReadPersonResponse } from './read-person.response'

@Injectable()
export class ReadPersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, ReadPersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, ReadPersonResponse>> {
    const person = await this.repository.read(id)

    if (!person) {
      return failure(new ResourceNotFoundError('Pessoa'))
    }

    return ok(this.mapper.map(person, Person, ReadPersonResponse))
  }
}
