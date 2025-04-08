import { EnvService } from '@koalarx/nest/env/env.service'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Prisma, PrismaClient } from '@prisma/client'
import { PrismaClientWithCustomTransaction } from './prisma-client-with-custom-transaction.interface'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, PrismaClientWithCustomTransaction
{
  constructor(private readonly env: EnvService) {
    super({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
      ],
    })
  }

  async onModuleInit() {
    if (this.env.get('PRISMA_QUERY_LOG')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.$on('query', async (e) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        console.log(`${e.query} ${e.params}`)
      })
    }
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }

  withTransaction<F>(
    fn: (prisma: Prisma.TransactionClient) => Promise<F>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    },
  ): Promise<F> {
    return this.$transaction(
      fn,
      options ?? {
        maxWait: 20000,
        timeout: 20000,
      },
    )
  }
}
