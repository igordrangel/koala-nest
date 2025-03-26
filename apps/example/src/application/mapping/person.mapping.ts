import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { PersonAddress } from '@/domain/entities/person/person-address'
import { PersonPhone } from '@/domain/entities/person/person-phone'
import { createMap } from '@koalarx/nest/core/mapping/create-map'
import { forMember } from '@koalarx/nest/core/mapping/for-member'
import {
  CreatePersonAddressRequest,
  CreatePersonPhoneRequest,
  CreatePersonRequest,
} from '../person/create/create-person.request'
import { ReadManyPersonRequest } from '../person/read-many/read-many-person.request'
import {
  ReadPersonAddressResponse,
  ReadPersonPhoneResponse,
  ReadPersonResponse,
} from '../person/read/read-person.response'
import {
  UpdatePersonAddressRequest,
  UpdatePersonPhoneRequest,
  UpdatePersonRequest,
} from '../person/update/update-person.request'

export class PersonMapping {
  static createMap() {
    createMap(CreatePersonAddressRequest, PersonAddress)
    createMap(CreatePersonPhoneRequest, PersonPhone)
    createMap(CreatePersonRequest, Person)

    createMap(PersonAddress, ReadPersonAddressResponse)
    createMap(PersonPhone, ReadPersonPhoneResponse)
    createMap(
      Person,
      ReadPersonResponse,
      forMember('status', (s) => (s.active === true ? 'active' : 'inactive')),
    )

    createMap(ReadManyPersonRequest, ReadManyPersonDto)

    createMap(UpdatePersonAddressRequest, PersonAddress)
    createMap(UpdatePersonPhoneRequest, PersonPhone)
    createMap(UpdatePersonRequest, Person)
  }
}
