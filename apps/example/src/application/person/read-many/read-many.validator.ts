import { booleanSchema } from '@koalarx/nest/core/controllers/schemas/boolean.schema'
import { LIST_QUERY_SCHEMA } from '@koalarx/nest/core/controllers/schemas/list-query.schema'
import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { ReadManyPersonRequest } from './read-many-person.request'

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return LIST_QUERY_SCHEMA.merge(
      z.object({
        name: z.string().optional().nullable(),
        active: booleanSchema().optional().nullable(),
      }),
    )
  }
}
