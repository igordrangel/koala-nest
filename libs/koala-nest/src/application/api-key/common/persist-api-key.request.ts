import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';
import { ApiKeyType } from '@/domain/entities/api-key/enums/api-key-type.enum';
import { ApiPropertyEnum } from '@/host/decorators/api-property-enum.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class PersistApiKeyRequest extends ObjectClass<PersistApiKeyRequest> {
  @ApiProperty({
    example: '203.0.113.10,api.parceiro.com',
    description:
      'Lista CSV. Para type=domain: IPs e/ou domínios. Para host: hostnames. Para uri: hostname+path.',
  })
  @AutoMap()
  origin: string;

  @ApiPropertyEnum({ enum: ApiKeyType })
  @AutoMap()
  type: ApiKeyType;
}
