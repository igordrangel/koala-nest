import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { CreatedRegistreResponseBase } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { InMemoryBaseRepository } from '@koalarx/nest/test/repositories/in-memory-base.repository'

export class PersonRepository
  extends InMemoryBaseRepository<Person>
  implements IPersonRepository
{
  create(person: Person): Promise<CreatedRegistreResponseBase<number>> {
    return this.insert(person)
  }

  update(person: Person): Promise<void> {
    return this.edit(person, (item) => item.id === person.id)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<ReadManyPersonDto>(
      query,
      (person) =>
        (!query.name || person.name.includes(query.name)) &&
        (query.active === undefined || person.active === query.active),
    )
  }

  delete(id: number): Promise<void> {
    return this.remove((person) => person.id === id)
  }
}
