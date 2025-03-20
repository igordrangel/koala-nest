import { ResourceNotFoundError } from '@koalarx/nest/common/errors/resource-not-found.error'
import { RequestHandlerBase } from '@koalarx/nest/common/mediator/request-handler.base'
import { ok, RequestResult } from '@koalarx/nest/common/mediator/request-result'
import { Injectable } from '@nestjs/common'
import { Mapper } from 'automapper-core'
import { InjectMapper } from 'automapper-nestjs'
import { Person } from '../../entities/person'
import { IPersonRepository } from '../../repositories/iperson.repository'
import { ReadPersonResponse } from '../read/read-person.response'
import { ReadManyPersonResponse } from './read-many-person.response'
import { ReadManyPersonRequest } from './read-many-person.request'
import { ReadManyPersonValidator } from './read-many.validator'

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  RequestResult<ResourceNotFoundError, ReadManyPersonResponse>
> {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    query: ReadManyPersonRequest,
  ): Promise<RequestResult<ResourceNotFoundError, ReadManyPersonResponse>> {
    const listOfPerson = await this.repository.readMany(
      new ReadManyPersonValidator(query).validate(),
    )

    return ok({
      ...listOfPerson,
      items: listOfPerson.items.map((person) =>
        this.mapper.map(person, Person, ReadPersonResponse),
      ),
    })
  }
}
