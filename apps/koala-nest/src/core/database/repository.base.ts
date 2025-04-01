import { toCamelCase } from '@koalarx/utils/operators/string'
import { Type } from '@nestjs/common'
import { ListResponse } from '..'
import { PaginationDto } from '../dtos/pagination.dto'
import { KoalaGlobalVars } from '../koala-global-vars'
import { IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { EntityActionType, EntityBase } from './entity.base'
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
  private readonly _modelName: Type<TEntity>
  private readonly _include?: RepositoryInclude<TEntity>

  constructor({ context, modelName, include }: RepositoryInitProps<TEntity>) {
    this._context = context
    this._modelName = modelName
    this._include = include
  }

  withTransaction(fn: (prisma: PrismaTransactionalClient) => Promise<any>) {
    return this._context.withTransaction(async (client) => {
      return fn(new (KoalaGlobalVars.dbTransactionContext as any)(client))
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
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findFirst<T>(where: T) {
    return this.context()
      .findFirst({
        include: this._include,
        where,
      })
      .then((response: TEntity) => {
        if (response) {
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findUnique<T>(where: T) {
    return this.context()
      .findUnique({
        include: this._include,
        where,
      })
      .then((response: TEntity) => {
        if (response) {
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findMany<T>(where: T, pagination?: PaginationDto) {
    return this.context()
      .findMany(this.findManySchema(where, pagination))
      .then((result: TEntity[]) =>
        result.map((response) => this.createEntity(response)),
      )
  }

  protected async findManyAndCount<T>(
    where: T,
    pagination?: PaginationDto,
  ): Promise<ListResponse<TEntity>> {
    const count = await this.context().count({ where })

    if (count > 0) {
      const items = await this.findMany(
        where,
        Object.assign(new PaginationDto(), pagination),
      )

      return { items, count }
    }

    return { items: [], count }
  }

  protected async saveChanges<TWhere = any>(
    entity: TEntity,
    updateWhere?: TWhere,
  ): Promise<TEntity | null> {
    const prismaEntity = this.entityToPrisma(entity)

    if (entity._action === EntityActionType.create) {
      return this.context()
        .create({
          data: prismaEntity,
          include: this._include,
        })
        .then((response: TEntity) => this.createEntity(response))
    } else {
      return this.withTransaction((client) =>
        this.context(client)
          .update({
            where: updateWhere ?? { id: entity._id },
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
      ).then(() => null)
    }
  }

  protected async remove<TWhere = any>(
    where: TWhere,
    externalServices?: Promise<any>,
  ) {
    const entity = await this.findUnique(where)

    const relationEntity: EntityBase<TEntity>[] = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof EntityBase) {
        relationEntity.push(entity[key])
      }
    })

    return this.withTransaction((client) =>
      (externalServices
        ? externalServices.then(() => client)
        : Promise.resolve(client)
      ).then((client) =>
        this.context(client)
          .delete({ where })
          .then((response) =>
            Promise.all(
              relationEntity.map((entity) =>
                this.orphanRemoval(client, entity),
              ),
            ).then(() => response),
          ),
      ),
    )
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
      .filter((key) => !['id', '_id', '_action'].includes(key))
      .filter((key) => !(entity[key] instanceof Function))
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
          prismaSchema[key] =
            entity[key]._action === EntityActionType.create
              ? { create: this.entityToPrisma(entity[key] as any) }
              : { update: this.entityToPrisma(entity[key] as any) }
        } else {
          prismaSchema[key] = entity[key]
        }
      })

    return prismaSchema
  }

  private context(transactionalClient?: PrismaTransactionalClient) {
    const modelName = this._modelName.name

    if (!modelName)
      throw new Error('modelName não informado no contrutor do repositorio')

    if (transactionalClient) {
      return transactionalClient[toCamelCase(modelName)]
    }

    return this._context[modelName]
  }

  private findManySchema<T>(where: T, pagination?: PaginationDto) {
    return {
      include: this._include,
      where,
      orderBy: pagination?.generateOrderBy(),
      skip: pagination?.skip(),
      take: (pagination?.limit ?? 0) > 0 ? pagination?.limit : undefined,
    }
  }

  private createEntity(data: any) {
    const entity = new this._modelName()
    entity._action = EntityActionType.update
    entity.automap(data)

    return entity
  }

  private orphanRemoval(
    client: PrismaTransactionalClient,
    entity: EntityBase<TEntity>,
  ) {
    const where = {}

    Object.keys(entity)
      .filter((key: string) => key === 'id' || key.includes('Id'))
      .forEach((key) => (where[key] = entity[key]))

    return client[toCamelCase(entity.constructor.name)].delete({ where })
  }
}
