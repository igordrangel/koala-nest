import { RequestValidatorBase } from '@/application/common/request-validator.base';
import z from 'zod';
import { ReadManyPersonRequest } from './read-many-person.request';
import { LIST_QUERY_SCHEMA } from '@/application/common/list-query.schema';

const optionalBooleanQuery = z.preprocess((value) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return undefined;
}, z.boolean().optional());

export class ReadManyPersonValidator extends RequestValidatorBase<ReadManyPersonRequest> {
  protected get schema() {
    return LIST_QUERY_SCHEMA.and(
      z.object({
        name: z.string().optional().nullable(),
        active: optionalBooleanQuery,
      }),
    );
  }
}
