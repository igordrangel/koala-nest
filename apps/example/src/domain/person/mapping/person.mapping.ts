import { List } from '@koalarx/nest/core/utils/list'
import { createMap, forMember, mapFrom, Mapper } from 'automapper-core'
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
  static createMap(mapper: Mapper) {
    createMap(mapper, CreatePersonPhoneRequest, PersonPhone)
    createMap(
      mapper,
      CreatePersonRequest,
      Person,
      forMember(
        (d) => d.phones,
        mapFrom((s) => {
          const phones = new List()

          s.phones.map((phone) =>
            phones.add(
              mapper.map(phone, CreatePersonPhoneRequest, PersonPhone),
            ),
          )

          return phones
        }),
      ),
    )

    createMap(mapper, PersonPhone, ReadPersonPhoneResponse)
    createMap(
      mapper,
      Person,
      ReadPersonResponse,
      forMember(
        (d) => d.phones,
        mapFrom((s) =>
          s.phones
            .toArray()
            .map((phone) =>
              mapper.map(phone, PersonPhone, ReadPersonPhoneResponse),
            ),
        ),
      ),
    )

    createMap(mapper, UpdatePersonPhoneRequest, PersonPhone)
    createMap(
      mapper,
      UpdatePersonRequest,
      Person,
      forMember(
        (d) => d.phones,
        mapFrom((s) => {
          const phones = new List()

          phones.setList(
            s.phones.map((phone) =>
              mapper.map(phone, UpdatePersonPhoneRequest, PersonPhone),
            ),
          )

          return phones
        }),
      ),
    )
  }
}
