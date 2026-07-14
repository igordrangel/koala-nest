import { AutoMap } from '@/core/tools/mapping';
import { ApiKeyType } from '@/domain/entities/api-key/enums/api-key-type.enum';
import { ApiPropertyEnum } from '@/host/decorators/api-property-enum.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadApiKeyResponse {
  @ApiProperty({ format: 'uuid' })
  @AutoMap()
  id: string;

  @ApiPropertyEnum({ enum: ApiKeyType })
  @AutoMap()
  type: ApiKeyType;

  @ApiProperty()
  @AutoMap()
  origin: string;

  @ApiProperty()
  @AutoMap()
  createdAt: Date;
}
