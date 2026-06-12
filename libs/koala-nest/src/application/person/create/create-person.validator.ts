import { RequestValidatorBase } from '@/application/common/request-validator.base';
import z from 'zod';
import { CreatePersonRequest } from './create-person.request';

export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema() {
    return z.object({
      name: z.string().min(1),
      address: z.object({
        address: z.string().min(1),
      }),
      contacts: z.array(
        z.object({
          contact: z.string().min(1),
        }),
      ),
    });
  }
}
