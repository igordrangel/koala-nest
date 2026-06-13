import { RequestValidatorBase } from '@/application/common/request-validator.base';
import {
  personAddressSchema,
  personContactSchema,
} from '@/application/person/person.schemas';
import { z } from 'zod';
import { UpdatePersonRequest } from './update-person.request';

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema() {
    return z.object({
      id: z.number().positive(),
      name: z.string().min(1),
      address: personAddressSchema(true),
      contacts: z.array(personContactSchema(true)),
    });
  }
}
