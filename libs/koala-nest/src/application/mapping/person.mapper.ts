import { createMap } from '@/core/tools/mapping';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import { PersonContact } from '@/domain/entities/person/person-contact';
import {
  CreatePersonAddressRequest,
  CreatePersonContactRequest,
  CreatePersonRequest,
} from '../person/create/create-person.request';
import { CreatePersonResponse } from '../person/create/create-person.response';
import { ReadManyPersonRequest } from '../person/read-many/read-many-person.request';
import {
  ReadPersonAddressResponse,
  ReadPersonContactResponse,
  ReadPersonResponse,
} from '../person/read/read-person.response';
import {
  UpdatePersonAddressRequest,
  UpdatePersonContactRequest,
  UpdatePersonRequest,
} from '../person/update/update-person.request';
import { ReadManyPersonResponseItem } from '../person/read-many/read-many-person.response';

export class PersonMapper {
  static createMap() {
    createMap(Person, CreatePersonResponse);

    createMap(Person, ReadPersonResponse);
    createMap(PersonAddress, ReadPersonAddressResponse);
    createMap(PersonContact, ReadPersonContactResponse);

    createMap(CreatePersonRequest, Person);
    createMap(CreatePersonAddressRequest, PersonAddress);
    createMap(CreatePersonContactRequest, PersonContact);

    createMap(UpdatePersonRequest, Person);
    createMap(UpdatePersonAddressRequest, PersonAddress);
    createMap(UpdatePersonContactRequest, PersonContact);

    createMap(ReadManyPersonRequest, PersonQueryDto);
    createMap(Person, ReadManyPersonResponseItem);
  }
}
