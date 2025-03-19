import { ApiProperty } from '@nestjs/swagger'

export type QueryDirectionType = 'asc' | 'desc'

export const QueryFilterParams = {
  direction: 'asc' as QueryDirectionType,
  page: 0,
  limit: 30,
}

export class PaginationParams {
  @ApiProperty({
    required: false,
    format: 'int32',
    default: QueryFilterParams.page,
  })
  page?: number = QueryFilterParams.page

  @ApiProperty({
    required: false,
    format: 'int32',
    default: QueryFilterParams.limit,
  })
  limit?: number = QueryFilterParams.limit

  @ApiProperty({
    required: false,
  })
  orderBy?: string

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    default: QueryFilterParams.direction,
  })
  direction?: QueryDirectionType = QueryFilterParams.direction

  skip() {
    return (this.limit ?? 0) * (this.page ?? QueryFilterParams.page)
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
