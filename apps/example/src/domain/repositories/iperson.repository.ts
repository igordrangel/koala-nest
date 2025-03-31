import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { ReadManyPersonDto } from '../dtos/read-many-person.dto'
import { Person } from '../entities/person/person'

export abstract class IPersonRepository {
  abstract save(person: Person): Promise<any>
  abstract read(id: number): Promise<Person | null>
  abstract readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>>
  abstract delete(id: number): Promise<void>
}
