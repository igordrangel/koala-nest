import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { EntityActionType } from '@koalarx/nest/core/database/entity.base'
import { InMemoryBaseRepository } from '@koalarx/nest/test/repositories/in-memory-base.repository'

export class PersonRepository
  extends InMemoryBaseRepository<Person>
  implements IPersonRepository
{
  save(person: Person): Promise<any> {
    if (person._action === EntityActionType.create) {
      person.active = false
    }

    return this.saveChanges(person, (item) => item.id === person.id)
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
