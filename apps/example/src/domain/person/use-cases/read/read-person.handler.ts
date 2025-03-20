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
import { ReadPersonResponse } from './read-person.response'

@Injectable()
export class ReadPersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, ReadPersonResponse>
> {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
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
