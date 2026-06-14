import {
  AutoMap,
  AutoMapper,
  createMap,
  forMember,
} from '@/core/tools/mapping';
import { MappingStore } from '@/core/tools/mapping/mapping-store';
import {
  Person,
  PersonAddress,
  PersonContact,
} from '../mockup/person/person.entities';
import {
  PersonAddressRequest,
  PersonContactRequest,
  PersonRequest,
} from '../mockup/person/person.requests';
import {
  PersonAddressResponse,
  PersonContactResponse,
  PersonResponse,
} from '../mockup/person/person.responses';

describe('AutoMapper', () => {
  it('should map the entity properties', () => {
    expect(MappingStore.getPropType(Person, 'contacts')).toBe(PersonContact);
    expect(MappingStore.getPropType(Person, 'address')).toBe(PersonAddress);
    expect(MappingStore.getPropType(Person, 'id')).toBe(Number);
    expect(MappingStore.getPropType(Person, 'name')).toBe(String);
  });

  it('should create a mapping', () => {
    createMap(Person, PersonResponse);
    createMap(PersonContact, PersonContactResponse);
    createMap(PersonAddress, PersonAddressResponse);
    createMap(PersonRequest, Person);
    createMap(PersonAddressRequest, PersonAddress);
    createMap(PersonContactRequest, PersonContact);

    const personMapping = MappingStore.getMapping(Person, PersonResponse);
    expect(personMapping).toBeDefined();
    expect(personMapping?.source).toBe(Person);
    expect(personMapping?.target).toBe(PersonResponse);
  });

  it('should map the entity to response', () => {
    const person = Person.from({
      id: 1,
      name: 'John Doe',
      address: PersonAddress.from({
        id: 1,
        address: '123 Main St',
      }),
      contacts: [],
    });

    person.contacts.push(
      PersonContact.from({
        id: 1,
        contact: 'john.doe@example.com',
        person: person,
      }),
    );

    const personDto = AutoMapper.map(person, Person, PersonResponse);

    expect(personDto).toBeDefined();
    expect(personDto.id).toBe(person.id);
    expect(personDto.name).toBe(person.name);

    expect(personDto.address).toBeInstanceOf(PersonAddressResponse);
    expect(personDto.address.id).toBe(person.address.id);
    expect(personDto.address.address).toBe(person.address.address);

    expect(personDto.contacts).toBeInstanceOf(Array);
    expect(personDto.contacts.length).toBe(person.contacts.length);
    expect(personDto.contacts[0]).toBeInstanceOf(PersonContactResponse);
    expect(personDto.contacts[0].id).toBe(person.contacts[0].id);
    expect(personDto.contacts[0].contact).toBe(person.contacts[0].contact);
  });

  it('should map the request to entity', () => {
    const personRequest = PersonRequest.from({
      name: 'John Doe',
      address: {
        address: '123 Main St',
      },
      contacts: [
        {
          contact: 'john.doe@example.com',
        },
      ],
    });

    const person = AutoMapper.map(personRequest, PersonRequest, Person);

    expect(person).toBeDefined();
    expect(person.name).toBe(personRequest.name);
    expect(person.address).toBeInstanceOf(PersonAddress);
    expect(person.address.address).toBe(personRequest.address.address);
    expect(person.contacts).toBeInstanceOf(Array);
    expect(person.contacts.length).toBe(personRequest.contacts.length);
    expect(person.contacts[0]).toBeInstanceOf(PersonContact);
    expect(person.contacts[0].contact).toBe(personRequest.contacts[0].contact);
  });

  it('should apply forMember custom mappings', () => {
    class SourceRequest {
      @AutoMap()
      firstName: string;

      @AutoMap()
      lastName: string;
    }

    class TargetEntity {
      @AutoMap()
      fullName: string;
    }

    createMap(
      SourceRequest,
      TargetEntity,
      forMember(
        'fullName',
        (source) => `${source.firstName} ${source.lastName}`,
      ),
    );

    const source = Object.assign(new SourceRequest(), {
      firstName: 'John',
      lastName: 'Doe',
    });

    const target = AutoMapper.map(source, SourceRequest, TargetEntity);

    expect(target.fullName).toBe('John Doe');
  });

  it('should map inherited properties from parent classes', () => {
    class BaseRequest {
      @AutoMap()
      page?: number;

      @AutoMap()
      limit?: number;
    }

    class ChildRequest extends BaseRequest {
      @AutoMap()
      name?: string;
    }

    class BaseDto {
      @AutoMap()
      page?: number = 0;

      @AutoMap()
      limit?: number = 10;
    }

    class ChildDto extends BaseDto {
      @AutoMap()
      name?: string;
    }

    createMap(ChildRequest, ChildDto);

    const source = Object.assign(new ChildRequest(), {
      page: 2,
      limit: 25,
      name: 'John',
    });

    const target = AutoMapper.map(source, ChildRequest, ChildDto);

    expect(target.page).toBe(2);
    expect(target.limit).toBe(25);
    expect(target.name).toBe('John');
  });

  it('should resolve inherited property types via getProps and getPropType', () => {
    class BaseRequest {
      @AutoMap()
      page?: number;
    }

    class ChildRequest extends BaseRequest {
      @AutoMap()
      name?: string;
    }

    const props = MappingStore.getProps(ChildRequest).map((p) => p.name);

    expect(props).toContain('page');
    expect(props).toContain('name');
    expect(MappingStore.getPropType(ChildRequest, 'page')).toBe(Number);
    expect(MappingStore.getPropType(ChildRequest, 'name')).toBe(String);
  });

  it('should map nested objects using the target property name', () => {
    class SourceChild {
      @AutoMap()
      street: string;
    }

    class SourceParent {
      @AutoMap()
      address: SourceChild;
    }

    class TargetChild {
      @AutoMap()
      line1: string;
    }

    class TargetParent {
      @AutoMap()
      address: TargetChild;
    }

    createMap(
      SourceChild,
      TargetChild,
      forMember('line1', (source) => source.street),
    );
    createMap(SourceParent, TargetParent);

    const source = Object.assign(new SourceParent(), {
      address: Object.assign(new SourceChild(), { street: '123 Main St' }),
    });

    const target = AutoMapper.map(source, SourceParent, TargetParent);

    expect(target.address).toBeInstanceOf(TargetChild);
    expect(target.address.line1).toBe('123 Main St');
  });
});
