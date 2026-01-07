import { EnvService } from '@koalarx/nest/env/env.service'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { PrismaClientWithCustomTransaction } from './prisma-client-with-custom-transaction.interface'
import { getPrismaClientClass } from './prisma-resolver'
import type { Prisma } from 'prisma/generated/client'

/**
 * Configure opções padrão do PrismaClient (ex: adapter).
 * Use isso na sua aplicação antes de inicializar o módulo Nest.
 */
let globalPrismaOptions = {} as Prisma.PrismaClientOptions

export function setPrismaClientOptions(options: Prisma.PrismaClientOptions) {
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

@Injectable()
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class PrismaService
  implements OnModuleInit, OnModuleDestroy, PrismaClientWithCustomTransaction
{
  private prismaInstance: any

  constructor(private readonly env: EnvService) {
    // Retorna um proxy para permitir acesso transparente às models
    // Isso é necessário porque repository.base.ts tenta acessar this._context[modelName]
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        // Propriedades e métodos da instância têm prioridade
        if (prop in target) {
          const value = Reflect.get(target, prop, receiver)
          if (typeof value === 'function') {
            return value.bind(target)
          }
          return value
        }

        // Caso a propriedade não exista, tenta acessar no prismaInstance
        // Isso permite acessar models (person, user, etc.) e métodos como $queryRaw
        if (target.prismaInstance && typeof prop === 'string') {
          const value = target.prismaInstance[prop]
          if (typeof value === 'function') {
            return value.bind(target.prismaInstance)
          }
          return value
        }

        return Reflect.get(target, prop, receiver)
      },
    }) as any
  }

  async initialize() {
    const PrismaClientType = await loadPrismaClient()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.prismaInstance = new PrismaClientType({
      log: [{ emit: 'event', level: 'query' }],
      ...globalPrismaOptions,
    } as Prisma.PrismaClientOptions)
  }

  async onModuleInit() {
    await this.initialize()
    if (this.env.get('PRISMA_QUERY_LOG')) {
      this.prismaInstance?.$on?.('query', async (e: any) => {
        console.log(`${e.query} ${e.params}`)
      })
    }
    return this.prismaInstance?.$connect?.()
  }

  onModuleDestroy() {
    return this.prismaInstance?.$disconnect?.()
  }

  async withTransaction<F>(
    fn: (prisma: Prisma.TransactionClient) => Promise<F>,
    options?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    },
  ): Promise<F> {
    return this.prismaInstance?.$transaction?.(
      fn,
      options ?? {
        maxWait: 20000,
        timeout: 20000,
      },
    )
  }

  // Expõe métodos e properties do PrismaClient dynamicamente
  // Isso permite que o repositório acesse models (person, user, etc.) via Proxy
  [Symbol.toPrimitive]() {
    return this.prismaInstance
  }

  toString() {
    return '[PrismaService]'
  }

  // Métodos úteis do PrismaClient
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

  // Proxy transparente para acessar models e qualquer outro property do PrismaClient
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.prismaInstance
  }
}
