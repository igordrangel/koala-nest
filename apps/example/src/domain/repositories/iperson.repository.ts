import { CreatedRegistreResponseBase } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { Person } from '../entities/person/person'
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request'

export abstract class IPersonRepository {
  abstract save(person: Person): Promise<CreatedRegistreResponseBase<number>>
  abstract read(id: number): Promise<Person | null>
  abstract readMany(
    query: ReadManyPersonRequest,
  ): Promise<ListResponseBase<Person>>

  abstract delete(id: number): Promise<void>
}
