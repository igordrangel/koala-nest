import { EnvService } from '@koalarx/nest/env/env.service'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClientWithCustomTransaction } from './prisma-client-with-custom-transaction.interface'
import { getPrismaClientClass } from './prisma-resolver'
import type { Prisma } from 'prisma/generated/client'
import type { PrismaClientOptions } from 'prisma/generated/internal/prismaNamespace'

/**
 * Configure opções padrão do PrismaClient (ex: adapter).
 * Use isso na sua aplicação antes de inicializar o módulo Nest.
 */
let globalPrismaOptions = {} as PrismaClientOptions

export function setPrismaClientOptions(options: PrismaClientOptions) {
  globalPrismaOptions = options
}

// Wrapper para carregar o PrismaClient dinamicamente
let PrismaClientClass: any = null

async function loadPrismaClient() {
  if (!PrismaClientClass) {
    PrismaClientClass = await getPrismaClientClass()
  }
  return PrismaClientClass
}

// Classe base que será estendida dinamicamente
class BasePrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaInstance: any

  constructor(private readonly env: EnvService) {}

  async initialize() {
    const PrismaClientType = await loadPrismaClient()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.prismaInstance = new PrismaClientType({
      log: [{ emit: 'event', level: 'query' }],
      ...globalPrismaOptions,
    } as PrismaClientOptions)
  }

  // Proxy para métodos do PrismaClient
  get $connect() {
    return this.prismaInstance?.$connect?.bind(this.prismaInstance)
  }

  get $disconnect() {
    return this.prismaInstance?.$disconnect?.bind(this.prismaInstance)
  }

  get $transaction() {
    return this.prismaInstance?.$transaction?.bind(this.prismaInstance)
  }

  get $on() {
    return this.prismaInstance?.$on?.bind(this.prismaInstance)
  }

  async onModuleInit() {
    await this.initialize()
    if (this.env.get('PRISMA_QUERY_LOG')) {
      this.$on('query', async (e: any) => {
        console.log(`${e.query} ${e.params}`)
      })
    }
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }

  async withTransaction<F>(
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
@Injectable()
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class PrismaService
  extends BasePrismaService
  implements PrismaClientWithCustomTransaction
{
  constructor(env: EnvService) {
    super(env)
  }
}
