import { RequestHandlerBase } from '@koalarx/nest/common/mediator/request-handler.base'
import { ok, RequestResult } from '@koalarx/nest/common/mediator/request-result'
import { Injectable } from '@nestjs/common'
import { Mapper } from 'automapper-core'
import { InjectMapper } from 'automapper-nestjs'
import { Person } from '../../entities/person'
import { IPersonRepository } from '../../repositories/iperson.repository'
import { CreatePersonRequest } from './create-person.request'
import { CreatePersonResponse } from './create-person.response'
import { CreatePersonValidator } from './create-person.validator'

@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  RequestResult<Error, CreatePersonResponse>
> {
  constructor(
    @InjectMapper()
    private readonly mapper: Mapper,
    private readonly repository: IPersonRepository,
  ) {
    super()
  }

  async handle(
    req: CreatePersonRequest,
  ): Promise<RequestResult<Error, CreatePersonResponse>> {
    const person = this.mapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    )

    const result = await this.repository.save(person)

    return ok({ id: result.id })
  }
}
