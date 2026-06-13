import { AutoMap } from '@/core/tools/mapping';

export class PersonAddressResponse {
  @AutoMap()
  id: number;

  @AutoMap()
  address: string;
}

export class PersonContactResponse {
  @AutoMap()
  id: number;

  @AutoMap()
  contact: string;
}

export class PersonResponse {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;

  @AutoMap()
  address: PersonAddressResponse;

  @AutoMap({ type: () => PersonContactResponse })
  contacts: PersonContactResponse[];
}
