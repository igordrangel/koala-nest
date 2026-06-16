import { ListResponseBase } from '@/core/common/list-response.base';
import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class ReadManyPersonResponseItem {
  @ApiProperty()
  @AutoMap()
  id: number;

  @ApiProperty()
  @AutoMap()
  name: string;

  @ApiProperty()
  @AutoMap()
  active: boolean;
}

export class ReadManyPersonResponse extends ListResponseBase<ReadManyPersonResponseItem> {}
