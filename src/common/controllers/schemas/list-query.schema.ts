import { z } from 'zod'
import { QueryFilterParams } from '../../models/pagination-params'

export const LIST_QUERY_SCHEMA = z.object({
  page: z.coerce
    .number()
    .transform((value) => {
      if (value) {
        return value - 1
      }
      return QueryFilterParams.page
    })
    .optional(),
  limit: z.coerce.number().default(QueryFilterParams.limit).optional(),
  orderBy: z.string().optional(),
  direction: z.enum(['asc', 'desc']).default('asc').optional(),
})
