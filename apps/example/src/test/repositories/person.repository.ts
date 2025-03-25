import { ReadManyPersonRequest } from "@/application/person/read-many/read-many-person.request";
import { Person } from "@/domain/entities/person/person";
import { IPersonRepository } from "@/domain/repositories/iperson.repository";
import { CreatedRegistreResponseBase } from "@koalarx/nest/core/controllers/created-registre-response.base";
import { ListResponseBase } from "@koalarx/nest/core/controllers/list-response.base";
import { InMemoryBaseRepository } from "@koalarx/nest/test/repositories/in-memory-base.repository";

export class PersonRepository extends InMemoryBaseRepository<Person> implements IPersonRepository {
  save(person: Person): Promise<CreatedRegistreResponseBase<number>> {
    return this.saveChanges(person)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonRequest): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<ReadManyPersonRequest>(query, (person) => 
      (!query.name || person.name.includes(query.name)) &&
      (query.active === undefined || person.active === query.active)
    )
  }

  delete(id: number): Promise<void> {
    return super.remove((person) => person.id === id)
  }
}