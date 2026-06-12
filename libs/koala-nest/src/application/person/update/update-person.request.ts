import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePersonAddressRequest {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: '123 Main St' })
  @AutoMap()
  address: string;
}

export class UpdatePersonContactRequest {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  @AutoMap()
  contact: string;
}

export class UpdatePersonRequest {
  @ApiProperty({ example: 1 })
  @AutoMap()
  id: number;

  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: () => UpdatePersonAddressRequest })
  @AutoMap()
  address: UpdatePersonAddressRequest;

  @ApiProperty({ type: () => UpdatePersonContactRequest, isArray: true })
  @AutoMap({ type: () => UpdatePersonContactRequest })
  contacts: UpdatePersonContactRequest[];
}
