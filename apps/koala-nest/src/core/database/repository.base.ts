import { toCamelCase } from '@koalarx/utils/KlString'
import { Type } from '@nestjs/common'
import { ListResponse } from '..'
import { PaginationDto } from '../dtos/pagination.dto'
import { KoalaGlobalVars } from '../koala-global-vars'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import { generateIncludeSchema } from '../utils/generate-prisma-include-schema'
import { IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { EntityActionType, EntityBase } from './entity.base'
import { PrismaTransactionalClient } from './prisma-transactional-client'
import { IdConfig } from './entity.decorator'

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
}

export abstract class RepositoryBase<
  TEntity extends EntityBase<TEntity>,
  TContext extends PrismaTransactionalClient = PrismaTransactionalClient,
  TModelKey extends keyof TContext = keyof TContext,
> {
  protected _context: TContext
  private readonly _modelName: Type<TEntity>
  private readonly _includeFindMany?: RepositoryInclude<TEntity>

  constructor({ context, modelName }: RepositoryInitProps<TEntity, TContext>) {
    this._context = context
    this._modelName = modelName

    this._includeFindMany = generateIncludeSchema({
      forList: true,
      deepLimit: 2,
      entity: this._modelName,
    })
  }

  private getIdPropName(entity?: TEntity): string | string[] {
    const idConfig = Reflect.getMetadata(
      'entity:id',
      entity ? entity.constructor.prototype : this._modelName.prototype,
    ) as IdConfig<TEntity>

    if (idConfig) {
      if (idConfig.single) {
        return idConfig.single as string
      } else if (idConfig.composite) {
        return idConfig.composite as string[]
      }
    }

    return 'id'
  }

  private getWhereByIdSchema(entity: TEntity, value: any) {
    const propIdName = this.getIdPropName(entity)

    if (Array.isArray(propIdName)) {
      const whereSchema = {}

      propIdName.forEach((propName) => {
        whereSchema[propName] =
          typeof value === 'object' ? value[propName] : value
      })

      return whereSchema
    }

    return {
      [propIdName]: typeof value === 'object' ? value[propIdName] : value,
    }
  }

  private getConnectPrismaSchemaForRelation(
    entity: TEntity | Type<TEntity>,
    data?: any,
  ) {
    return {
      connect: this.getWhereByIdSchema(entity as any, data ?? entity),
    }
  }

  private checkIdHasValue(entity: TEntity, value: any) {
    const result = this.getWhereByIdSchema(entity, value)

    return Object.values(result).every(
      (val) => val !== undefined && val !== null,
    )
  }

  private getSelectRootPrismaSchema(entity: TEntity) {
    const selectSchema = {}

    const entityProps = AutoMappingList.getAllProps(entity as any)

    entityProps.forEach((prop) => {
      let instance

      try {
        instance = new (prop.type())()
      } catch {
        instance = null
      }

      if (instance instanceof EntityBase) {
        selectSchema[prop.name] = {
          select: this.getSelectRootPrismaSchema(instance.constructor as any),
        }
      } else {
        selectSchema[prop.name] = true
      }
    })

    return selectSchema
  }

  private getSelectWithRelationsId(entity: TEntity) {
    const selectSchema = {}

    const entityProps = AutoMappingList.getAllProps(entity as any)

    entityProps.forEach((prop) => {
      let instance

      try {
        instance = new (prop.type())()
      } catch {
        instance = null
      }

      if (instance instanceof EntityBase) {
        selectSchema[prop.name] = {
          select: this.getWhereByIdSchema(instance as any, true),
        }
      } else if (instance instanceof List) {
        const list = new (entity as any)()[prop.name] as List<any>
        const entityInstance = list.entityType! as any

        selectSchema[prop.name] = {
          select: this.getWhereByIdSchema(new entityInstance(), true),
        }
      } else {
        selectSchema[prop.name] = true
      }
    })

    return selectSchema
  }

  private getPropNameFromEntitySource(source: TEntity, entity: Type<TEntity>) {
    const entityProps = AutoMappingList.getAllProps(source as any)

    return entityProps.find((prop) => {
      let instance

      try {
        instance = new (prop.type())()
      } catch {
        instance = null
      }

      if (instance) {
        if (instance.constructor.name === entity.name) {
          return true
        } else if (source[prop.name] instanceof List) {
          const list = source[prop.name] as List<any>
          return list.entityType?.name === entity.name
        }
      }

      return false
    })?.name
  }

  private listRelationEntities(entity: TEntity, fromList = false) {
    const relationEntities: TEntity[] = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof List) {
        const list = entity[key]

        list.toArray('added').forEach((item) => {
          relationEntities.push(item)
        })

        list.toArray('updated').forEach((item) => {
          relationEntities.push(item)
        })
      } else if (entity[key] instanceof EntityBase && !fromList) {
        relationEntities.push(entity[key] as any)
      }
    })

    return relationEntities
  }

  private listToRelationActionList(entity: TEntity) {
    type RelationActionList = Array<{
      modelName: string
      entityInstance: Type<TEntity>
      schema: any
      relations: TEntity[]
    }>

    const relationCreates: RelationActionList = []
    const relationUpdates: RelationActionList = []
    const relationDeletes: RelationActionList = []

    Object.keys(entity).forEach((key) => {
      if (entity[key] instanceof List) {
        const list = entity[key]
        const entityInstance = list.entityType! as any
        const modelName = entityInstance.name
        const parentModelName = entity.constructor.name
        const parentPropName =
          this.getPropNameFromEntitySource(
            entityInstance,
            entity.constructor as any,
          ) ?? toCamelCase(parentModelName)

        if (modelName) {
          list.toArray('removed').forEach((item) => {
            relationDeletes.push({
              modelName: toCamelCase(modelName),
              entityInstance,
              schema: this.getWhereByIdSchema(item, item),
              relations: [],
            })
          })

          list.toArray('added').forEach((item) => {
            relationCreates.push({
              modelName: toCamelCase(modelName),
              entityInstance,
              schema: {
                data: {
                  ...this.entityToPrisma(item),
                  [parentPropName]:
                    this.getConnectPrismaSchemaForRelation(entity),
                },
                select: this.getSelectRootPrismaSchema(item.constructor as any),
              },
              relations: this.listRelationEntities(item, true),
            })
          })

          list.toArray('updated').forEach((item) => {
            relationUpdates.push({
              modelName: toCamelCase(modelName),
              entityInstance,
              schema: {
                where: this.getWhereByIdSchema(item, item),
                data: this.entityToPrisma(item),
                select: this.getSelectRootPrismaSchema(item.constructor as any),
              },
              relations: this.listRelationEntities(item, true),
            })
          })
        }
      } else if (entity[key] instanceof EntityBase) {
        const entityInstance = entity[key] as any
        const modelName = (entity[key] as any).constructor.name

        if (entity[key]._action === EntityActionType.update) {
          relationUpdates.push({
            modelName: toCamelCase(modelName),
            entityInstance,
            schema: {
              where: { id: entityInstance._id },
              data: this.entityToPrisma(entityInstance),
              select: this.getSelectRootPrismaSchema(
                entityInstance.constructor as any,
              ),
            },
            relations: this.listRelationEntities(entityInstance),
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
            if (entity[key] && this.checkIdHasValue(entity, entity[key])) {
              prismaSchema[key] = {
                connectOrCreate: {
                  where: this.getWhereByIdSchema(
                    (entity[key] as any).constructor,
                    entity[key],
                  ),
                  create: this.entityToPrisma(entity[key] as any),
                },
              }
            } else {
              prismaSchema[key] = {
                create: this.entityToPrisma(entity[key] as any),
              }
            }
          } else {
            prismaSchema[key] = this.getConnectPrismaSchemaForRelation(
              entity[key] as any,
            )
          }
        } else if (!Array.isArray(entity[key])) {
          prismaSchema[key] = entity[key]
        }
      })

    return prismaSchema
  }

  private getInclude(include?: RepositoryInclude<TEntity>) {
    include = include ?? {}

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

  private findManySchema<T>(where: T, pagination?: PaginationDto) {
    return {
      include: this.getInclude(this._includeFindMany),
      where,
      orderBy: pagination?.generateOrderBy(),
      skip: pagination?.skip(),
      take: (pagination?.limit ?? 0) > 0 ? pagination?.limit : undefined,
    }
  }

  private createEntity(data: any, entityClass?: Type<TEntity>) {
    const entity = new (entityClass || this._modelName)()
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

  private getIdOnEntity(entity: TEntity, data: any): string {
    const propIdName = this.getIdPropName(entity)

    if (Array.isArray(propIdName)) {
      const idValues: string[] = []

      propIdName.forEach((propName) => {
        idValues.push(data[propName])
      })

      return idValues.join('-')
    }

    return data[propIdName]
  }

  private async loadRelationForEntity(
    where: Record<string, any>,
    entity: TEntity,
    cache: Map<string, any>,
  ): Promise<any> {
    return this._context[toCamelCase(toCamelCase((entity as any).name))]
      .findFirst({
        select: this.getSelectRootPrismaSchema(entity),
        where,
      })
      .then((data) => this.enrichEntityWithRelations(entity, data, cache))
  }

  private async enrichEntityWithRelations(
    entity: TEntity,
    data: any,
    cache: Map<string, any> = new Map(),
  ): Promise<any> {
    if (!data) return data

    const relationQueries: Promise<any>[] = []
    const relationKeys: string[] = []

    const allProps = AutoMappingList.getAllProps(entity as any)

    allProps.forEach((prop) => {
      const propName = prop.name
      const propDef = AutoMappingList.getPropDefinitions(
        entity as any,
        propName,
      )

      if (propDef?.type === List.name) {
        const list = new (entity as any)()[prop.name] as List<any>
        const entityInstance = list.entityType! as any

        relationKeys.push(propName)

        const items: Promise<any>[] = []

        data[propName]?.forEach((item) => {
          const cacheKey = `${(entity as any).name}-${propName}-${this.getIdOnEntity(new entityInstance(), item)}`

          if (cache.has(cacheKey)) {
            items.push(Promise.resolve(cache.get(cacheKey)))
            return
          }

          cache.set(cacheKey, item)

          items.push(
            this.loadRelationForEntity(
              this.getWhereByIdSchema(new entityInstance(), item),
              entityInstance,
              cache,
            ),
          )
        })

        relationQueries.push(Promise.all(items))
        return
      }

      const relationEntity = AutoMappingList.getSourceByName(
        propDef?.type ?? '',
      )

      if (relationEntity && data[propName]) {
        const cacheKey = `${(entity as any).name}-${propName}-${this.getIdOnEntity(new relationEntity(), data[propName])}`

        if (cache.has(cacheKey)) {
          data[propName] = cache.get(cacheKey)
          return
        }

        cache.set(cacheKey, data[propName])

        relationKeys.push(propName)

        relationQueries.push(
          this.loadRelationForEntity(
            this.getWhereByIdSchema(relationEntity as any, data[propName]),
            relationEntity as any,
            cache,
          ),
        )
      }
    })

    if (relationQueries.length > 0) {
      const results = await Promise.all(relationQueries)

      relationKeys.forEach((key, index) => {
        data[key] = results[index]
      })
    }

    return data
  }

  private async persistRelations(
    transaction: PrismaTransactionalClient,
    entity: TEntity,
  ) {
    const { relationCreates, relationUpdates, relationDeletes } =
      this.listToRelationActionList(entity)

    await Promise.all(
      relationDeletes.map((relation) =>
        transaction[relation.modelName].deleteMany({
          where: relation.schema,
        }),
      ),
    )

    return Promise.all([
      ...relationCreates.map(
        (relationCreate) =>
          transaction[relationCreate.modelName]
            .create(relationCreate.schema)
            .then((response) => {
              if (relationCreate.relations.length === 0) {
                return Promise.all([])
              }

              return Promise.all(
                relationCreate.relations.map((relation) => {
                  const relationPropName = this.getPropNameFromEntitySource(
                    relation,
                    relationCreate.entityInstance,
                  )

                  if (
                    relationPropName &&
                    !(relation[relationPropName] instanceof List)
                  ) {
                    relation[relationPropName] =
                      this.getConnectPrismaSchemaForRelation(
                        relationCreate.entityInstance as any,
                        response,
                      )
                  }

                  return transaction[toCamelCase(relation.constructor.name)]
                    .create({
                      data: this.entityToPrisma(relation),
                      select: this.getSelectRootPrismaSchema(
                        relation.constructor as any,
                      ),
                    })
                    .then((response: TEntity) => {
                      const idPropName = this.getIdPropName(relation)

                      if (!Array.isArray(idPropName)) {
                        relation[idPropName] = response[idPropName]
                      } else {
                        idPropName.forEach((propName) => {
                          relation[propName] = response[propName]
                        })
                      }

                      return this.persistRelations(transaction, relation)
                    })
                }),
              )
            }),
        ...relationUpdates.map((relation) =>
          transaction[relation.modelName].update(relation.schema),
        ),
      ),
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
    const data = await (this.context() as any).findFirst({
      select: this.getSelectWithRelationsId(
        this._modelName.prototype.constructor,
      ),
      where: this.getWhereByIdSchema(this._modelName.prototype.constructor, {
        id,
      }),
    })

    if (!data) return null

    const enrichedEntity = await this.enrichEntityWithRelations(
      this._modelName.prototype.constructor,
      { ...data },
    )
    return this.createEntity(enrichedEntity)
  }

  protected async findFirst<T>(where: T): Promise<TEntity | null> {
    const data = await (this.context() as any).findFirst({
      select: this.getSelectWithRelationsId(
        this._modelName.prototype.constructor,
      ),
      where,
    })

    if (!data) return null

    const enrichedEntity = await this.enrichEntityWithRelations(
      this._modelName.prototype.constructor,
      { ...data },
    )
    return this.createEntity(enrichedEntity)
  }

  protected async findUnique<T>(where: T): Promise<TEntity | null> {
    const data = await (this.context() as any).findUnique({
      select: this.getSelectWithRelationsId(
        this._modelName.prototype.constructor,
      ),
      where,
    })

    if (!data) return null

    const enrichedEntity = await this.enrichEntityWithRelations(
      this._modelName.prototype.constructor,
      { ...data },
    )
    return this.createEntity(enrichedEntity)
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
            const idPropName = this.getIdPropName(entity)

            if (!Array.isArray(idPropName)) {
              entity[idPropName] = response[idPropName]
            } else {
              idPropName.forEach((propName) => {
                entity[propName] = response[propName]
              })
            }

            return this.persistRelations(client, entity).then(() => entity)
          }),
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
    notCascadeEntityProps?: Array<keyof TEntity>,
    externalServices?: Promise<any>,
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
    notCascadeEntityProps?: Array<keyof TEntity>,
    externalServices?: Promise<any>,
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
