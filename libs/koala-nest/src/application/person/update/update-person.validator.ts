import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { personBodySchema } from '@/application/person/person.schemas';
import { UpdatePersonRequest } from './update-person.request';

export class UpdatePersonValidator extends RequestValidatorBase<UpdatePersonRequest> {
  protected get schema() {
    return personBodySchema(true);
  }
}
