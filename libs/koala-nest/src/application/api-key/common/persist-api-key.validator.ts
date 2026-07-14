import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { persistApiKeySchema } from './persist-api-key.schema';
import { PersistApiKeyRequest } from './persist-api-key.request';

export class PersistApiKeyValidator extends RequestValidatorBase<PersistApiKeyRequest> {
  protected get schema() {
    return persistApiKeySchema;
  }
}
