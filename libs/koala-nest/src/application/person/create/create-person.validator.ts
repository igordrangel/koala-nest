import { RequestValidatorBase } from '@/application/common/request-validator.base';
import {
  personAddressSchema,
  personContactSchema,
} from '@/application/person/person.schemas';
import { z } from 'zod';
import { CreatePersonRequest } from './create-person.request';

export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema() {
    return z.object({
      name: z.string().min(1),
      address: personAddressSchema(),
      contacts: z.array(personContactSchema()),
    });
  }
}
