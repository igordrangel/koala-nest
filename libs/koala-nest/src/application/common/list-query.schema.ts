import { QUERY_FILTER_PARAMS } from '@/core/constants/query-params';
import { z } from 'zod';

export const LIST_QUERY_SCHEMA = z.object({
  page: z.coerce
    .number()
    .transform((value) => {
      if (value) {
        return value - 1;
      }
      return QUERY_FILTER_PARAMS.page;
    })
    .optional(),
  limit: z.coerce.number().default(QUERY_FILTER_PARAMS.limit).optional(),
  orderBy: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('asc').optional(),
});
