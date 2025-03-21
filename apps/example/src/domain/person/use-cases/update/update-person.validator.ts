import { RequestValidatorBase } from '@koalarx/nest/common/mediator/request-validator.base'
import { z, ZodType, ZodTypeDef } from 'zod'
import { UpdatePersonRequest } from './update-person.request'

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string(),
      phones: z.array(
        z.object({
          id: z.number(),
          phone: z.string(),
        }),
      ),
    })
  }
}
