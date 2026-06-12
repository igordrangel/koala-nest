import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePersonAddressRequest extends ObjectClass<CreatePersonAddressRequest> {
  @ApiProperty({ example: '123 Main St' })
  @AutoMap()
  address: string;
}

export class CreatePersonContactRequest extends ObjectClass<CreatePersonContactRequest> {
  @ApiProperty({ example: 'john.doe@example.com' })
  @AutoMap()
  contact: string;
}

export class CreatePersonRequest extends ObjectClass<CreatePersonRequest> {
  @ApiProperty({ example: 'John Doe' })
  @AutoMap()
  name: string;

  @ApiProperty({ type: CreatePersonAddressRequest })
  @AutoMap()
  address: CreatePersonAddressRequest;

  @ApiProperty({ type: CreatePersonContactRequest, isArray: true })
  @AutoMap({ type: () => CreatePersonContactRequest })
  contacts: CreatePersonContactRequest[];
}
