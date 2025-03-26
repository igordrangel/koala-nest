import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import { Person } from '@/domain/entities/person/person'
import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import { CreatedRegistreResponseBase } from '@koalarx/nest/core/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/core/controllers/list-response.base'
import { RepositoryBase } from '@koalarx/nest/core/database/repository.base'
import { PRISMA_TOKEN } from '@koalarx/nest/core/koala-nest-database.module'
import { Inject, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DbTransactionContext } from '../db-transaction-context'

@Injectable()
export class PersonRepository
  extends RepositoryBase<Person>
  implements IPersonRepository
{
  constructor(
    @Inject(PRISMA_TOKEN)
    prisma: DbTransactionContext,
  ) {
    super({
      modelName: Person,
      context: prisma,
      include: { phones: true },
    })
  }

  create(person: Person): Promise<CreatedRegistreResponseBase<number>> {
    return this.insert(person)
  }

  update(person: Person): Promise<void> {
    return this.edit(person)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonDto): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<Prisma.PersonWhereInput>(
      {
        name: {
          contains: query.name,
        },
        active: query.active,
      },
      query,
    )
  }

  delete(id: number): Promise<void> {
    return this.remove<Prisma.PersonWhereUniqueInput>({ id })
  }
}
