import { createMap } from '@koalarx/nest/core/mapping/create-map'
import { Person } from '../entities/person'
import { PersonPhone } from '../entities/person-phone'
import {
  CreatePersonPhoneRequest,
  CreatePersonRequest,
} from '../use-cases/create/create-person.request'
import {
  ReadPersonPhoneResponse,
  ReadPersonResponse,
} from '../use-cases/read/read-person.response'
import {
  UpdatePersonPhoneRequest,
  UpdatePersonRequest,
} from '../use-cases/update/update-person.request'

export class PersonMapping {
  static createMap() {
    createMap(CreatePersonPhoneRequest, PersonPhone)
    createMap(CreatePersonRequest, Person)

    createMap(PersonPhone, ReadPersonPhoneResponse)
    createMap(Person, ReadPersonResponse)

    createMap(UpdatePersonPhoneRequest, PersonPhone)
    createMap(UpdatePersonRequest, Person)
  }
}
