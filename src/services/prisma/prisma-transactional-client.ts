// @ts-nocheck
import { Prisma, PrismaPromise } from '@prisma/client'
import { PrismaClientWithCustomTransaction } from './prisma-client-with-custom-transaction.interface'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class PrismaTransactionalClient
  implements PrismaClientWithCustomTransaction
{
  constructor(
    protected readonly transactionalClient: Prisma.TransactionClient,
  ) {}

  async withTransaction<F>(
    fn: (prisma: Prisma.TransactionClient) => Promise<F>,
  ): Promise<F> {
    return await fn(this.transactionalClient)
  }

  $executeRaw(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): PrismaPromise<number> {
    return this.transactionalClient.$executeRaw(query, ...values)
  }

  $executeRawUnsafe(query: string, ...values: any[]): PrismaPromise<number> {
    return this.transactionalClient.$executeRawUnsafe(query, ...values)
  }

  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): PrismaPromise<T> {
    return this.transactionalClient.$queryRaw(query, ...values)
  }

  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): PrismaPromise<T> {
    return this.transactionalClient.$queryRawUnsafe(query, ...values)
  }
}
