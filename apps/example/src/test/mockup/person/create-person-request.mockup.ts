import { CreatePersonRequest } from "@/application/person/create/create-person.request";
import { assignObject } from "@koalarx/nest/core/utils/assing-object";
import { faker } from "@faker-js/faker";

export const createPersonRequestMockup = assignObject(CreatePersonRequest, {
  name: faker.person.fullName(),
  phones: [{phone: faker.phone.number()}]
})