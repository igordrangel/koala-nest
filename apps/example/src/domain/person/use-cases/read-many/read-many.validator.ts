import { RequestValidatorBase } from '@koalarx/nest/common/mediator/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { ReadManyPersonRequest } from './read-many-person.request'
import { LIST_QUERY_SCHEMA } from '@koalarx/nest/common/controllers/schemas/list-query.schema'

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return LIST_QUERY_SCHEMA.merge(
      z.object({
        name: z.string().optional().nullable(),
      }),
    )
  }
}
