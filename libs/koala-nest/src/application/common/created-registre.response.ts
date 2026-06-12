import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

abstract class CreatedRegistreResponseBase<TId> {
  @ApiProperty()
  @AutoMap()
  id: TId;
}

export abstract class CreatedRegistreWithUUIDResponse extends CreatedRegistreResponseBase<string> {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @AutoMap()
  declare id: string;
}

export abstract class CreatedRegistreWithIdResponse extends CreatedRegistreResponseBase<number> {
  @ApiProperty({ type: 'integer', format: 'int32' })
  @AutoMap()
  declare id: number;
}
