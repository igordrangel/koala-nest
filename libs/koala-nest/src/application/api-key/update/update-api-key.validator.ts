import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { persistApiKeySchema } from '@/application/api-key/common/persist-api-key.schema';
import { UpdateApiKeyRequest } from './update-api-key.request';
import { z } from 'zod';

export class UpdateApiKeyValidator extends RequestValidatorBase<UpdateApiKeyRequest> {
  protected get schema() {
    return persistApiKeySchema.extend({
      id: z.uuid(),
    });
  }
}
