import { RequestValidatorBase } from '@/application/common/request-validator.base';
import { booleanSchema, LIST_QUERY_SCHEMA } from '@/core/schemas';
import { z } from 'zod';
import { ReadManyPersonRequest } from './read-many-person.request';

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema() {
    return LIST_QUERY_SCHEMA.and(
      z.object({
        name: z.string().optional().nullable(),
        active: booleanSchema(),
      }),
    );
  }
}
