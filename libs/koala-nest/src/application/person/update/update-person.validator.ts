import { RequestValidatorBase } from '@/application/common/request-validator.base';
import z from 'zod';
import { UpdatePersonRequest } from './update-person.request';

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema() {
    return z.object({
      id: z.number().positive(),
      name: z.string().min(1),
      address: z.object({
        id: z.number().positive(),
        address: z.string().min(1),
      }),
      contacts: z.array(
        z.object({
          id: z.number().positive().optional(),
          contact: z.string().min(1),
        }),
      ),
    });
  }
}
