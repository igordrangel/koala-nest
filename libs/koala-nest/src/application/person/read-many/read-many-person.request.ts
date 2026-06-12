import { PaginationRequest } from '@/application/common/pagination.request';
import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class ReadManyPersonRequest extends PaginationRequest {
  @ApiProperty()
  @AutoMap()
  name?: string;
}
