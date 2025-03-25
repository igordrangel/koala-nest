import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { CreatePersonRequest } from './create-person.request'
import { z, ZodType, ZodTypeDef } from 'zod'

export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string(),
      phones: z.array(
        z.object({
          phone: z.string(),
        }),
      ),
    })
  }
}
