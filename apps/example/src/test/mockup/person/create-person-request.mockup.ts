import { CreatePersonRequest } from '@/application/person/create/create-person.request'
import { faker } from '@faker-js/faker'
import { assignObject } from '@koalarx/nest/core/utils/assing-object'

export const createPersonRequestMockup = assignObject(CreatePersonRequest, {
  name: faker.person.fullName(),
  phones: [{ phone: faker.phone.number() }],
  address: { address: faker.location.streetAddress() },
})
