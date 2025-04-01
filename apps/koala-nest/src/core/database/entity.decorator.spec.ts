import { faker } from '@faker-js/faker'
import { AutoMap } from '../mapping/auto-mapping.decorator'
import { List } from '../utils/list'
import { EntityBase } from './entity.base'
import { Entity } from './entity.decorator'

@Entity()
export class PersonAddress extends EntityBase<PersonAddress> {
  @AutoMap()
  id: number

  @AutoMap()
  address: string
}

@Entity()
export class PersonPhone extends EntityBase<PersonPhone> {
  @AutoMap()
  id: number

  @AutoMap()
  phone: string
}

@Entity()
export class Person extends EntityBase<Person> {
  @AutoMap()
  id: number

  @AutoMap()
  name: string

  @AutoMap({ type: List })
  phones = new List(PersonPhone)

  @AutoMap({ type: PersonAddress })
  address: PersonAddress

  @AutoMap()
  active: boolean
}

describe('Entity decorator', () => {
  it('should create an instance of Person', () => {
    const person = new Person({
      name: faker.person.fullName(),
      phones: [
        { phone: faker.phone.number() },
        { phone: faker.phone.number() },
      ],
      address: { address: faker.location.streetAddress() },
      active: true,
    } as any)

    expect(person).toBeInstanceOf(Person)
    expect(person).toBeInstanceOf(EntityBase)
    expect(person.constructor.name).toBe('Person')

    expect(person.phones).toBeInstanceOf(List)
    expect(person.phones.toArray()[0]).toBeInstanceOf(PersonPhone)
    expect(person.phones.toArray()[1]).toBeInstanceOf(PersonPhone)
    expect(person.phones.toArray()[0].phone).toBeDefined()
    expect(person.phones.toArray()[1].phone).toBeDefined()

    expect(person.address.constructor.name).equal(PersonAddress.name)
    expect(person.address.address).toBeDefined()

    expect(person.name).toBeDefined()
    expect(person.active).toBe(true)
  })
})
