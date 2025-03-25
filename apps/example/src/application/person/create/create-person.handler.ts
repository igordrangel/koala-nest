import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'
import { CreatePersonRequest } from './create-person.request'
import { CreatePersonResponse } from './create-person.response'
import { CreatePersonValidator } from './create-person.validator'

@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  RequestResult<Error, CreatePersonResponse>
> {
  constructor(
    private readonly mapper: AutoMappingService,
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
