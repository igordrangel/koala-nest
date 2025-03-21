import { CreatedRegistreResponseBase } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { Person } from '../entities/person'
import { ReadManyPersonRequest } from '../use-cases/read-many/read-many-person.request'

export abstract class IPersonRepository {
  abstract save(person: Person): Promise<CreatedRegistreResponseBase>
  abstract read(id: number): Promise<Person | null>
  abstract readMany(
    query: ReadManyPersonRequest,
  ): Promise<ListResponseBase<Person>>

  abstract delete(id: number): Promise<void>
}
