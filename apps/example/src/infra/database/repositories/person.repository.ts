import { Person } from '@/domain/person/entities/person'
import { IPersonRepository } from '@/domain/person/repositories/iperson.repository'
import { ReadManyPersonRequest } from '@/domain/person/use-cases/read-many/read-many-person.request'
import { CreatedRegistreResponseBase } from '@koalarx/nest/common/controllers/created-registre-response.base'
import { ListResponseBase } from '@koalarx/nest/common/controllers/list-response.base'
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
      transactionContext: DbTransactionContext,
      include: { phones: true },
    })
  }

  save(person: Person): Promise<CreatedRegistreResponseBase> {
    return this.saveChanges(person)
  }

  read(id: number): Promise<Person | null> {
    return this.findById(id)
  }

  readMany(query: ReadManyPersonRequest): Promise<ListResponseBase<Person>> {
    return this.findManyAndCount<Prisma.PersonWhereInput>(
      {
        name: {
          contains: query.name,
        },
      },
      query,
    )
  }

  delete(id: number): Promise<void> {
    return super.delete(id)
  }
}
