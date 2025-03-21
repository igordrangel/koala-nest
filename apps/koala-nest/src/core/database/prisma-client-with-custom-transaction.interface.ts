import { Prisma } from '@prisma/client'

export interface PrismaClientWithCustomTransaction
  extends Readonly<Prisma.TransactionClient> {
  withTransaction<F>(
    fn: (prisma: Prisma.TransactionClient) => Promise<F>,
    options?: {
      maxWait?: number | undefined
      timeout?: number | undefined
      isolationLevel?: Prisma.TransactionIsolationLevel | undefined
    },
  ): Promise<F>
}
