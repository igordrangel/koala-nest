import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class ReadPersonAddressResponse {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: '123 Main St' })
  @AutoMap()
  address: string;
}

export class ReadPersonContactResponse {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  @AutoMap()
  contact: string;
}

export class ReadPersonResponse {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: () => ReadPersonAddressResponse })
  @AutoMap()
  address: ReadPersonAddressResponse;

  @ApiProperty({ type: () => ReadPersonContactResponse, isArray: true })
  @AutoMap({ type: () => ReadPersonContactResponse })
  contacts: ReadPersonContactResponse[];
}
