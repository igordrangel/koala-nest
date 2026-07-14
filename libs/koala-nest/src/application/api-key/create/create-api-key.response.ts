import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApiKeyResponse extends ObjectClass<CreateApiKeyResponse> {
  @ApiProperty({ type: 'string', format: 'uuid' })
  @AutoMap()
  id: string;

  @ApiProperty({
    description: 'JWT da API Key — exibido apenas neste response de criação.',
  })
  @AutoMap()
  key: string;
}
