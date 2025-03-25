import { CreatePersonPhoneRequest, CreatePersonRequest } from '@/application/person/create/create-person.request'
import { ReadPersonPhoneResponse, ReadPersonResponse } from '@/application/person/read/read-person.response'
import { UpdatePersonPhoneRequest, UpdatePersonRequest } from '@/application/person/update/update-person.request'
import { createMap } from '@koalarx/nest/core/mapping/create-map'
import { forMember } from '@koalarx/nest/core/mapping/for-member'
import { Person } from '../entities/person/person'
import { PersonPhone } from '../entities/person/person-phone'

export class PersonMapping {
  static createMap() {
    createMap(CreatePersonPhoneRequest, PersonPhone)
    createMap(CreatePersonRequest, Person)

    createMap(PersonPhone, ReadPersonPhoneResponse)
    createMap(
      Person,
      ReadPersonResponse,
      forMember('status', (s) => (s.active === true ? 'active' : 'inactive')),
    )

    createMap(UpdatePersonPhoneRequest, PersonPhone)
    createMap(UpdatePersonRequest, Person)
  }
}
