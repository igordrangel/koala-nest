import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';

export class PersonAddressRequest extends ObjectClass<PersonAddressRequest> {
  @AutoMap()
  address: string;
}

export class PersonContactRequest extends ObjectClass<PersonContactRequest> {
  @AutoMap()
  contact: string;
}

export class PersonRequest extends ObjectClass<PersonRequest> {
  @AutoMap()
  name: string;

  @AutoMap()
  address: PersonAddressRequest;

  @AutoMap({ type: () => PersonContactRequest })
  contacts: PersonContactRequest[];
}
