import { RequestValidatorBase } from '@/application/common/request-validator.base';
import z from 'zod';
import { ReadManyPersonRequest } from './read-many-person.request';
import { LIST_QUERY_SCHEMA } from '@/application/common/list-query.schema';

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema() {
    return LIST_QUERY_SCHEMA.and(
      z.object({
        name: z.string().optional().nullable(),
      }),
    );
  }
}
