// @ts-nocheck
import { PrismaClientWithCustomTransaction } from '@koalarx/nest/services/prisma/prisma-client-with-custom-transaction.interface'
import { PrismaTransactionalClient } from '@koalarx/nest/services/prisma/prisma-transactional-client'
import { Prisma } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class DbTransactionContext
  extends PrismaTransactionalClient
  implements PrismaClientWithCustomTransaction
{
  get person(): Prisma.PersonDelegate<DefaultArgs> {
    return this.transactionalClient.person
  }

  get personPhone(): Prisma.PersonPhoneDelegate<DefaultArgs> {
    return this.transactionalClient.personPhone
  }
}
