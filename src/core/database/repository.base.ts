import { PaginationParams } from '../../common/models/pagination-params'
import { PrismaClientWithCustomTransaction } from '../../services/prisma/prisma-client-with-custom-transaction.interface'
import { PrismaTransactionalClient } from '../../services/prisma/prisma-transactional-client'
import {
  ModelName,
  getPrismaDelegate,
} from '../../services/prisma/prisma.types'
import { Entity } from './entity'

export interface FindAllProps<
  TPaginateAndOrdering extends PaginationParams,
  TWhere,
  TInclude = any,
> {
  where: TWhere
  paginateAndOrderingProps?: TPaginateAndOrdering
  include?: TInclude
}

export abstract class RepositoryBase<TEntity extends Entity<TEntity>> {
  constructor(
    protected prisma: PrismaClientWithCustomTransaction,
    private readonly _modelName: ModelName,
  ) {}

  withTransaction(fn: (prisma: PrismaTransactionalClient) => Promise<any>) {
    return this.prisma.withTransaction(async (client) => {
      return fn(new PrismaTransactionalClient(client))
    })
  }

  protected repository(transactionalClient?: PrismaTransactionalClient) {
    const modelName = this._modelName as ModelName
    const prisma = (transactionalClient ?? this.prisma) as any

    const repository = getPrismaDelegate(modelName, prisma)

    if (!repository)
      throw new Error('Entidade não mapeada no repositório do prisma')

    return repository
  }
}
