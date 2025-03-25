import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { RequestHandlerBase } from '@koalarx/nest/core/request-overflow/request-handler.base'
import {
  failure,
  ok,
  RequestResult,
} from '@koalarx/nest/core/request-overflow/request-result'
import { Injectable } from '@nestjs/common'

@Injectable()
export class DeletePersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, null>
> {
  constructor(private readonly repository: IPersonRepository) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, null>> {
    const person = await this.repository.read(id)

    if (!person) {
      return failure(new ResourceNotFoundError('Pessoa'))
    }

    await this.repository.delete(id)

    return ok(null)
  }
}
