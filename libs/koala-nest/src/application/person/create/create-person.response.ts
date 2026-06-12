import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonResponse {
  @ApiProperty({ type: 'integer', format: 'int32' })
  @AutoMap()
  id: number;
}
