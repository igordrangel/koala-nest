import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { Person } from '../../entities/person'
import { IPersonRepository } from '../../repositories/iperson.repository'
import { ReadPersonResponse } from '../read/read-person.response'
import { ReadManyPersonRequest } from './read-many-person.request'
import { ReadManyPersonResponse } from './read-many-person.response'
import { ReadManyPersonValidator } from './read-many.validator'

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  RequestResult<ResourceNotFoundError, ReadManyPersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
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
