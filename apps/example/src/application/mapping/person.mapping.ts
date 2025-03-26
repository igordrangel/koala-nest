import { ReadManyPersonDto } from "@/domain/dtos/read-many-person.dto"
import { Person } from "@/domain/entities/person/person"
import { PersonPhone } from "@/domain/entities/person/person-phone"
import { createMap } from "@koalarx/nest/core/mapping/create-map"
import { forMember } from "@koalarx/nest/core/mapping/for-member"
import { CreatePersonPhoneRequest, CreatePersonRequest } from "../person/create/create-person.request"
import { ReadManyPersonRequest } from "../person/read-many/read-many-person.request"
import { ReadPersonPhoneResponse, ReadPersonResponse } from "../person/read/read-person.response"
import { UpdatePersonPhoneRequest, UpdatePersonRequest } from "../person/update/update-person.request"

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

    createMap(ReadManyPersonRequest, ReadManyPersonDto)

    createMap(UpdatePersonPhoneRequest, PersonPhone)
    createMap(UpdatePersonRequest, Person)
  }
}
