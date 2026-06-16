import { QUERY_FILTER_PARAMS } from '@/core/constants/query-params';
import { AutoMap } from '@/core/tools/mapping';
import type { QueryDirectionType } from '@/core/types';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationRequest {
  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.page,
  })
  @AutoMap()
  page?: number = QUERY_FILTER_PARAMS.page;

  @ApiProperty({
    required: false,
    format: 'int32',
    default: QUERY_FILTER_PARAMS.limit,
  })
  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit;

  @ApiProperty({
    required: false,
  })
  @AutoMap()
  orderBy?: string;

  @ApiProperty({
    required: false,
    enum: ['asc', 'desc'],
    default: QUERY_FILTER_PARAMS.direction,
  })
  @AutoMap()
  direction?: QueryDirectionType = QUERY_FILTER_PARAMS.direction;
}
