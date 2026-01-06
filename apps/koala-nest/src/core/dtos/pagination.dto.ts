import type { QueryDirectionType } from '..'
import { QUERY_FILTER_PARAMS } from '../constants/query-params'
import { AutoMap } from '../mapping/auto-mapping.decorator'

export class PaginationDto {
  @AutoMap()
  page?: number = 0

  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit

  @AutoMap()
  orderBy?: string = ''

  @AutoMap()
  direction?: QueryDirectionType = 'asc'

  skip() {
    return (this.limit ?? 0) * (this.page ?? QUERY_FILTER_PARAMS.page)
  }

  generateOrderBy() {
    if (this.orderBy) {
      const orderByField = this.orderBy.split('.')
      return orderByField.reduceRight(
        (acc, item, index) => ({
          [item]: index === orderByField.length - 1 ? this.direction : acc,
        }),
        {},
      )
    }

    return undefined
  }
}
