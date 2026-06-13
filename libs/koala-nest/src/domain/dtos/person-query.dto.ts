import { AutoMap } from '@/core/tools/mapping';
import { PaginationDto } from './pagination.dto';

export class PersonQueryDto extends PaginationDto {
  @AutoMap()
  name?: string;

  @AutoMap()
  active?: boolean;
}
