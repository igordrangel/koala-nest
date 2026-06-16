import { AutoMap } from '@/core/tools/mapping';
import { PaginationDto } from './pagination.dto';

export class PersonQueryDto extends PaginationDto {
  @AutoMap()
  name?: string;

  @AutoMap()
  active?: boolean;

  override generateOrderBy() {
    if (this.orderBy) {
      return super.generateOrderBy();
    }

    return { id: 'asc' };
  }
}
