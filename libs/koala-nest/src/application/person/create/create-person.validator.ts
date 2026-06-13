import { RequestValidatorBase } from '@/application/common/request-validator.base';
import {
  personBodySchema,
} from '@/application/person/person.schemas';
import { CreatePersonRequest } from './create-person.request';

export class CreatePersonValidator extends RequestValidatorBase<CreatePersonRequest> {
  protected get schema() {
    return personBodySchema();
  }
}
