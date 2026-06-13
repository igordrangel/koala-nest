import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';
import { ListResponse } from '@/core/types';
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

export class ReadManyPersonResponse extends ObjectClass<
  ListResponse<ReadManyPersonResponseItem>
> {
  @ApiProperty({ type: [ReadManyPersonResponseItem] })
  @AutoMap({ type: () => ReadManyPersonResponseItem })
  items: ReadManyPersonResponseItem[];

  @ApiProperty()
  @AutoMap()
  count: number;
}
