import { toCamelCase } from '@koalarx/utils/operators/string'
import { Type } from '@nestjs/common'
import { ListResponse } from '../@types'
import { PaginationParams } from '../models/pagination-params'
import { IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { EntityBase } from './entity.base'
import { PrismaTransactionalClient } from './prisma-transactional-client'

type RepositoryInclude<TEntity> = {
  [key in keyof TEntity]?: boolean | RepositoryInclude<TEntity[keyof TEntity]>
}

interface RepositoryInitProps<TEntity> {
  context: PrismaTransactionalClient
  modelName: Type<TEntity>
  transactionContext?: Type<PrismaTransactionalClient>
  include?: RepositoryInclude<TEntity>
}

export abstract class RepositoryBase<TEntity extends EntityBase<TEntity>> {
  protected _context: PrismaTransactionalClient
  private _transactionContext?: Type<PrismaTransactionalClient>
  private readonly _modelName: Type<TEntity>
  private readonly _include?: RepositoryInclude<TEntity>

  constructor({
    context,
    transactionContext,
    modelName,
    include,
  }: RepositoryInitProps<TEntity>) {
    this._context = context
    this._transactionContext = transactionContext
    this._modelName = modelName
    this._include = include
  }

  withTransaction(fn: (prisma: PrismaTransactionalClient) => Promise<any>) {
    return this._context.withTransaction(async (client) => {
      return fn(new (this._transactionContext as any)(client))
    })
  }

  protected async findById(id: IComparableId): Promise<TEntity | null> {
    return this.context()
      .findFirst({
        include: this._include,
        where: { id },
      })
      .then((response: TEntity) => {
        if (response) {
          return new this._modelName(response)
        }

        return null
      })
  }

  protected async findMany<T>(where: T, pagination?: PaginationParams) {
    return this.context()
      .findMany(this.findManySchema(where, pagination))
      .then((result: TEntity[]) => {
        return result.map((response) => {
          const entity = new this._modelName()
          entity.automap(response)

          return entity
        })
      })
  }

  protected async findManyAndCount<T>(
    where: T,
    pagination?: PaginationParams,
  ): Promise<ListResponse<TEntity>> {
    const count = await this.context().count({ where })

    if (count > 0) {
      const items = await this.findMany(
        where,
        Object.assign(new PaginationParams(), pagination),
      )

      return { items, count }
    }

    return { items: [], count }
  }

  protected saveChanges(entity: TEntity) {
    const prismaEntity = this.entityToPrisma(entity)

    const isCreate = !entity._id

    if (isCreate) {
      return this.context().create({
        data: prismaEntity,
      })
    } else {
      return this.withTransaction((client) =>
        this.context(client)
          .update({
            where: { id: entity._id },
            data: prismaEntity,
          })
          .then(() => {
            const { relationUpdates, relationDeletes } =
              this.listToRelationActionList(entity)

            return Promise.all([
              ...relationUpdates.map((relation) =>
                client[relation.modelName].updateMany(relation.schema),
              ),
              ...relationDeletes.map((relation) =>
                client[relation.modelName].deleteMany(relation.schema),
              ),
            ])
          }),
      )
    }
  }

  protected delete(id: IComparableId) {
    return this.context().delete({
      where: { id },
    })
  }

  private listToRelationActionList(entity: TEntity) {
    type RelationActionList = Array<{
      modelName: string
      schema: any
    }>

    const relationUpdates: RelationActionList = []
    const relationDeletes: RelationActionList = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof List) {
        const list = entity[key]
        const modelName = list.entityType?.name

        if (modelName) {
          list.toArray('removed').forEach((item) => {
            relationDeletes.push({
              modelName: toCamelCase(modelName),
              schema: { where: { id: item._id } },
            })
          })

          list.toArray('updated').forEach((item) => {
            relationUpdates.push({
              modelName: toCamelCase(modelName),
              schema: {
                where: { id: item._id },
                data: this.entityToPrisma(item),
              },
            })
          })
        }
      }
    })

    return { relationUpdates, relationDeletes }
  }

  private entityToPrisma(entity: TEntity) {
    const prismaSchema = {}

    Object.keys(entity)
      .filter((key) => key !== 'id' && key !== '_id')
      .forEach((key) => {
        if (entity[key] instanceof List) {
          if (entity[key].toArray('added').length > 0) {
            prismaSchema[key] = {
              createMany: {
                data: entity[key].toArray('added').map((item) => {
                  return this.entityToPrisma(item)
                }),
              },
            }
          }
        } else if (entity[key] instanceof EntityBase) {
          prismaSchema[key] = this.entityToPrisma(entity[key] as any)
        } else {
          prismaSchema[key] = entity[key]
        }
      })

    return prismaSchema
  }

  private context(transactionalClient?: PrismaTransactionalClient) {
    const modelName = this._modelName?.name

    if (!modelName)
      throw new Error('modelName não informado no contrutor do repositorio')

    if (transactionalClient) {
      return transactionalClient[toCamelCase(modelName)]
    }

    return this._context[modelName]
  }

  private findManySchema<T>(where: T, pagination?: PaginationParams) {
    return {
      include: this._include,
      where,
      orderBy: pagination?.generateOrderBy(),
      skip: pagination?.skip(),
      take: (pagination?.limit ?? 0) > 0 ? pagination?.limit : undefined,
    }
  }
}
