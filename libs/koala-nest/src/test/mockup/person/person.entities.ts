import { EntityBase } from '@/core/base/entity.base';
import { AutoMap } from '@/core/tools/mapping';

export class PersonAddress extends EntityBase<PersonAddress> {
  @AutoMap()
  id: number;

  @AutoMap()
  address: string;
}

export class Person extends EntityBase<Person> {
  @AutoMap()
  id: number;

  @AutoMap()
  name: string;

  @AutoMap()
  address: PersonAddress;

  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}

export class PersonContact extends EntityBase<PersonContact> {
  @AutoMap()
  id: number;

  @AutoMap()
  contact: string;

  @AutoMap()
  person: Person;
}
