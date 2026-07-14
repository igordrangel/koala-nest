import { ListResponseBase } from '@/core/common/list-response.base';
import { AutoMap } from '@/core/tools/mapping';
import { ReadApiKeyResponse } from '@/application/api-key/read/read-api-key.response';
import { ApiProperty } from '@nestjs/swagger';

export class ReadManyApiKeyResponseItem extends ReadApiKeyResponse {}

export class ReadManyApiKeyResponse extends ListResponseBase<ReadManyApiKeyResponseItem> {
  @ApiProperty({ type: ReadManyApiKeyResponseItem, isArray: true })
  @AutoMap({ type: () => ReadManyApiKeyResponseItem })
  declare items: ReadManyApiKeyResponseItem[];
}
