import { ApiProperty } from '@nestjs/swagger'
import { AutoMap } from '../mapping/auto-mapping.decorator'
import { QUERY_FILTER_PARAMS } from '../constants/query-params'
import { QueryDirectionType } from '..'

export type PaginatedRequestProps<T extends PaginationRequest> = Omit<
  { [K in keyof T as T[K] extends Function ? never : K]: T[K] },
  '_id'
>

export class PaginationRequest {
  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.page,
  })
  @AutoMap()
  page?: number = QUERY_FILTER_PARAMS.page

  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.limit,
  })
  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit

  @ApiProperty({
    required: false,
  })
  @AutoMap()
  orderBy?: string

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    default: QUERY_FILTER_PARAMS.direction,
  })
  @AutoMap()
  direction?: QueryDirectionType = QUERY_FILTER_PARAMS.direction
}
