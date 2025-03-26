import { CreatedRegistreResponseBase } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { ReadManyPersonDto } from '../dtos/read-many-person.dto'
import { Person } from '../entities/person/person'

export abstract class IPersonRepository {
  abstract create(person: Person): Promise<CreatedRegistreResponseBase<number>>
  abstract update(person: Person): Promise<void>
  abstract read(id: number): Promise<Person | null>
  abstract readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>>
  abstract delete(id: number): Promise<void>
}
