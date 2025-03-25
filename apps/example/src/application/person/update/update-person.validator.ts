import { RequestValidatorBase } from '@koalarx/nest/core/request-overflow/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { UpdatePersonRequest } from './update-person.request'

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string(),
      phones: z.array(
        z.object({
          id: z.number().nullable().optional(),
          phone: z.string(),
        }),
      ),
    })
  }
}
