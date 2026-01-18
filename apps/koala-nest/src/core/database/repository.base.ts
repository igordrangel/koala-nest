import { toCamelCase } from '@koalarx/utils/KlString'
import { Type } from '@nestjs/common'
import { ListResponse } from '..'
import { PaginationDto } from '../dtos/pagination.dto'
import { KoalaGlobalVars } from '../koala-global-vars'
import { IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { EntityActionType, EntityBase } from './entity.base'
import { PrismaTransactionalClient } from './prisma-transactional-client'

type RepositoryInclude<TEntity> = Omit<
  {
    [K in keyof TEntity as TEntity[K] extends Function ? never : K]?:
      | boolean
      | (TEntity[K] extends List<infer U>
          ? RepositoryInclude<U>
          : RepositoryInclude<TEntity[K]>)
  },
  '_id' | '_action'
>

interface RepositoryInitProps<
  TEntity extends EntityBase<TEntity>,
  TContext extends PrismaTransactionalClient,
> {
  context: TContext
  modelName: Type<TEntity>
  transactionContext?: Type<TContext>
  include?: RepositoryInclude<TEntity>
}

export abstract class RepositoryBase<
  TEntity extends EntityBase<TEntity>,
  TContext extends PrismaTransactionalClient = PrismaTransactionalClient,
  TModelKey extends keyof TContext = keyof TContext,
> {
  protected _context: TContext
  private readonly _modelName: Type<TEntity>
  private readonly _include?: RepositoryInclude<TEntity>

  constructor({
    context,
    modelName,
    include,
  }: RepositoryInitProps<TEntity, TContext>) {
    this._context = context
    this._modelName = modelName
    this._include = include
  }

  private listRelationEntities(entity: TEntity) {
    const relationEntities: TEntity[] = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof List) {
        const list = entity[key]

        list.toArray('added').forEach((item) => {
          relationEntities.push(item)
          relationEntities.push(...this.listRelationEntities(item))
        })

        list.toArray('updated').forEach((item) => {
          relationEntities.push(item)
          relationEntities.push(...this.listRelationEntities(item))
        })
      } else if (entity[key] instanceof EntityBase) {
        relationEntities.push(entity[key] as any)
        relationEntities.push(...this.listRelationEntities(entity[key] as any))
      }
    })

    return relationEntities
  }

  private listToRelationActionList(entity: TEntity) {
    type RelationActionList = Array<{
      modelName: string
      schema: any
      relations: TEntity[]
    }>

    const relationCreates: RelationActionList = []
    const relationUpdates: RelationActionList = []
    const relationDeletes: RelationActionList = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof List) {
        const list = entity[key]
        const modelName = list.entityType?.name
        const parentModelName = entity.constructor.name

        if (modelName) {
          list.toArray('removed').forEach((item) => {
            relationDeletes.push({
              modelName: toCamelCase(modelName),
              schema: { where: { id: item._id } },
              relations: [],
            })
          })

          list.toArray('added').forEach((item) => {
            relationCreates.push({
              modelName: toCamelCase(modelName),
              schema: {
                data: {
                  ...this.entityToPrisma(item),
                  [toCamelCase(parentModelName)]: {
                    connect: {
                      [this.getIdPropName(entity)]:
                        entity[this.getIdPropName(entity)],
                    },
                  },
                },
              },
              relations: this.listRelationEntities(item),
            })
          })

          list.toArray('updated').forEach((item) => {
            relationUpdates.push({
              modelName: toCamelCase(modelName),
              schema: {
                where: { id: item._id },
                data: this.entityToPrisma(item),
              },
              relations: this.listRelationEntities(item),
            })
          })
        }
      }
    })

    return { relationCreates, relationUpdates, relationDeletes }
  }

  private entityToPrisma(entity: TEntity) {
    const prismaSchema = {}

    Object.keys(entity)
      .filter((key) => !['id', '_id', '_action'].includes(key))
      .filter(
        (key) =>
          !(entity[key] instanceof Function || entity[key] instanceof List),
      )
      .forEach((key) => {
        if (entity[key] instanceof EntityBase) {
          if (entity[key]._action === EntityActionType.create) {
            if (entity[key][this.getIdPropName()]) {
              prismaSchema[key] = {
                connectOrCreate: {
                  where: {
                    [this.getIdPropName()]: entity[key][this.getIdPropName()],
                  },
                  create: this.entityToPrisma(entity[key] as any),
                },
              }
            } else {
              prismaSchema[key] = {
                create: this.entityToPrisma(entity[key] as any),
              }
            }
          } else {
            prismaSchema[key] = {
              update: this.entityToPrisma(entity[key] as any),
            }
          }
        } else {
          prismaSchema[key] = entity[key]
        }
      })

    return prismaSchema
  }

  private findManySchema<T>(where: T, pagination?: PaginationDto) {
    return {
      include: this.getInclude(),
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

  private getIdPropName(entity?: TEntity) {
    return (
      Reflect.getMetadata(
        'entity:id',
        entity ? entity.constructor.prototype : this._modelName.prototype,
      ) ?? 'id'
    )
  }

  private getInclude(include?: RepositoryInclude<TEntity>) {
    include = include ?? this._include ?? {}

    const result = {}

    Object.keys(include).forEach((key) => {
      if (typeof include[key] === 'boolean') {
        result[key] = include[key]
      } else {
        result[key] = {
          include: this.getInclude(include[key]),
        }
      }
    })

    return result
  }

  private getPropNameFromEntitySource(source: TEntity, entity: TEntity) {
    return Object.keys(source).find((key) => {
      if (source[key] instanceof EntityBase) {
        return source[key].constructor.name === entity.constructor.name
      } else if (source[key] instanceof List) {
        const list = source[key] as List<any>
        return list.entityType?.name === entity.constructor.name
      }

      return false
    })
  }

  private persistRelations(
    transaction: PrismaTransactionalClient,
    entity: TEntity,
  ) {
    const { relationCreates, relationUpdates, relationDeletes } =
      this.listToRelationActionList(entity)

    return Promise.all([
      ...relationCreates.map((relationCreate) =>
        transaction[relationCreate.modelName]
          .create(relationCreate.schema)
          .then((response) => {
            return Promise.all(
              relationCreate.relations.map((relation) => {
                const relationPropName = this.getPropNameFromEntitySource(
                  entity,
                  relation,
                )

                if (!relationPropName) {
                  throw new Error(
                    `Propname not found for relation entity ${relation.constructor.name} on entity ${entity.constructor.name}`,
                  )
                }

                entity.automap(response)

                relation[relationPropName] = entity

                return this.persistRelations(transaction, relation)
              }),
            )
          }),
      ),
      ...relationUpdates.map((relation) =>
        transaction[relation.modelName].update(relation.schema),
      ),
      ...relationDeletes.map((relation) => this.removeMany(relation.schema)),
    ])
  }

  protected context(transactionalClient?: TContext): TContext[TModelKey] {
    const modelName = this._modelName.name

    if (!modelName)
      throw new Error('modelName não informado no contrutor do repositorio')

    const contextKey = toCamelCase(modelName) as TModelKey

    if (transactionalClient) {
      return transactionalClient[contextKey] as any
    }

    return this._context[contextKey] as any
  }

  protected async findById(id: IComparableId): Promise<TEntity | null> {
    return (this.context() as any)
      .findFirst({
        include: this.getInclude(),
        where: { [this.getIdPropName()]: id },
      })
      .then((response: TEntity) => {
        if (response) {
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findFirst<T>(where: T): Promise<TEntity | null> {
    return (this.context() as any)
      .findFirst({
        include: this.getInclude(),
        where,
      })
      .then((response: TEntity) => {
        if (response) {
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findUnique<T>(where: T): Promise<TEntity | null> {
    return (this.context() as any)
      .findUnique({
        include: this.getInclude(),
        where,
      })
      .then((response: TEntity) => {
        if (response) {
          return this.createEntity(response)
        }

        return null
      })
  }

  protected async findMany<T>(
    where: T,
    pagination?: PaginationDto,
  ): Promise<TEntity[]> {
    return (this.context() as any)
      .findMany(this.findManySchema(where, pagination))
      .then((result: TEntity[]) =>
        result.map((response) => this.createEntity(response)),
      )
  }

  protected async findManyAndCount<T>(
    where: T,
    pagination?: PaginationDto,
  ): Promise<ListResponse<TEntity>> {
    const count = await (this.context() as any).count({ where })

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
  ): Promise<TEntity> {
    const prismaEntity = this.entityToPrisma(entity)

    if (entity._action === EntityActionType.create) {
      return this.withTransaction((client) =>
        (this.context(client) as any)
          .create({
            data: prismaEntity,
            include: this.getInclude(),
          })
          .then((response: TEntity) => {
            entity[this.getIdPropName()] = response[this.getIdPropName()]
            return this.persistRelations(client, entity).then(() => entity)
          }),
      ).then(
        (response: TEntity) =>
          this.findUnique({
            [this.getIdPropName()]: response[this.getIdPropName()],
          }) as Promise<TEntity>,
      )
    } else {
      const where = updateWhere ?? { id: entity._id }

      return this.withTransaction((client) =>
        (this.context(client) as any)
          .update({
            where,
            data: prismaEntity,
          })
          .then(() => this.persistRelations(client, entity)),
      ).then(() => this.findUnique(where) as Promise<TEntity>)
    }
  }

  protected async saveMany<TWhere = any>(
    entities: TEntity[],
    updateWhere?: TWhere,
  ): Promise<void> {
    await this.withTransaction(async (client) => {
      const prismaEntities = entities.map((entity) =>
        this.entityToPrisma(entity),
      )

      return Promise.all([
        (this.context(client) as any).createMany({
          data: prismaEntities,
          skipDuplicates: true,
        }),
        ...entities
          .filter((entity) => !!entity._id)
          .map((entity) =>
            (this.context(client) as any).update({
              data: entity,
              where: updateWhere ?? { id: entity._id },
            }),
          ),
      ])
    })
  }

  protected async remove<TWhere = any>(
    where: TWhere,
    externalServices?: Promise<any>,
    notCascadeEntityProps?: Array<keyof TEntity>,
  ) {
    const entity = await this.findUnique(where)

    if (!entity) {
      throw new Error(`Entity not found for where: ${JSON.stringify(where)}`)
    }

    const relationEntity: EntityBase<TEntity>[] = []

    Object.keys(entity).forEach((key) => {
      if (
        entity[key] instanceof EntityBase &&
        !notCascadeEntityProps?.includes(key as keyof TEntity)
      ) {
        relationEntity.push(entity[key])
      }
    })

    return this.withTransaction((client) =>
      (externalServices
        ? externalServices.then(() => client)
        : Promise.resolve(client)
      ).then((client) =>
        (this.context(client) as any)
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

  protected async removeMany<TWhere = any>(
    where: TWhere,
    externalServices?: Promise<any>,
    notCascadeEntityProps?: Array<keyof TEntity>,
  ): Promise<void> {
    const entities = await this.findMany(where)

    if (entities.length === 0) {
      throw new Error(`Entities not found for where: ${JSON.stringify(where)}`)
    }

    return this.withTransaction((client) =>
      (externalServices
        ? externalServices.then(() => client)
        : Promise.resolve(client)
      ).then(async (client) => {
        const relationEntity: EntityBase<TEntity>[] = []

        for (const entity of entities) {
          Object.keys(entity).forEach((key) => {
            if (
              entity[key] instanceof EntityBase &&
              !notCascadeEntityProps?.includes(key as keyof TEntity)
            ) {
              relationEntity.push(entity[key])
            }
          })
        }

        return (this.context(client) as any)
          .deleteMany({ where })
          .then((response) =>
            Promise.all(
              relationEntity.map((entity) =>
                this.orphanRemoval(client, entity),
              ),
            ).then(() => response),
          )
      }),
    )
  }

  withTransaction(fn: (prisma: TContext) => Promise<any>) {
    return this._context.withTransaction(async (client) => {
      return fn(new (KoalaGlobalVars.dbTransactionContext as any)(client))
    })
  }
}
