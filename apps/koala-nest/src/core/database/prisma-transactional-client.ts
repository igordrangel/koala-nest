import { Prisma } from 'prisma/generated/client'

export abstract class PrismaTransactionalClient {
  [key: symbol]: any

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
  ): Prisma.PrismaPromise<number> {
    return this.transactionalClient.$executeRaw(query, ...values)
  }

  $executeRawUnsafe(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<number> {
    return this.transactionalClient.$executeRawUnsafe(query, ...values)
  }

  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T> {
    return this.transactionalClient.$queryRaw(query, ...values)
  }

  $queryRawUnsafe<T = unknown>(
    query: string,
    ...values: any[]
  ): Prisma.PrismaPromise<T> {
    return this.transactionalClient.$queryRawUnsafe(query, ...values)
  }
}
