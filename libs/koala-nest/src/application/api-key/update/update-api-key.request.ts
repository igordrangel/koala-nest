import { PersistApiKeyRequest } from '@/application/api-key/common/persist-api-key.request';
import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyRequest extends PersistApiKeyRequest {
  @ApiProperty({ format: 'uuid' })
  @AutoMap()
  id: string;
}
