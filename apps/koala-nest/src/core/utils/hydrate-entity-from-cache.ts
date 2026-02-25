import { Type } from '@nestjs/common'

export type GraphVisitState = 'loading' | 'loaded'

export interface HydrateEntityFromCacheDependencies {
  getAllProps(entity: Type<any>): Array<{ name: string }>
  getPropDefinitions(
    entity: Type<any>,
    propName: string,
  ):
    | {
        type?: string
      }
    | undefined
  getSourceByName(sourceName: string): Type<any> | undefined
  getListEntityType(entity: Type<any>, propName: string): Type<any> | undefined
  getIdOnEntity(entity: any, data: any): string
  createEntity(entity: Type<any>): any
}

export interface HydrateEntityFromCacheParams {
  entity: Type<any>
  data: any
  cache: Map<string, any>
  dependencies: HydrateEntityFromCacheDependencies
  visitState?: Map<string, GraphVisitState>
}

function mergeScalarProps(target: any, source: any) {
  Object.keys(source || {}).forEach((key) => {
    const value = source[key]

    if (value === undefined) {
      return
    }

    if (Array.isArray(value)) {
      return
    }

    if (value !== null && typeof value === 'object') {
      return
    }

    target[key] = value
  })
}

function getCacheKey(
  entity: Type<any>,
  data: any,
  dependencies: HydrateEntityFromCacheDependencies,
) {
  const entityId = dependencies.getIdOnEntity(
    dependencies.createEntity(entity),
    data,
  )

  return `${entity.name}-${entityId}`
}

export function hydrateEntityFromCache({
  entity,
  data,
  cache,
  dependencies,
  visitState = new Map<string, GraphVisitState>(),
}: HydrateEntityFromCacheParams): any {
  if (!data) {
    return data
  }

  const cacheKey = getCacheKey(entity, data, dependencies)
  const sourceData = cache.get(cacheKey) ?? data

  let canonicalEntity = cache.get(cacheKey)

  if (!canonicalEntity) {
    canonicalEntity = sourceData
    cache.set(cacheKey, canonicalEntity)
  }

  mergeScalarProps(canonicalEntity, sourceData)

  if (visitState.get(cacheKey) === 'loading') {
    return canonicalEntity
  }

  visitState.set(cacheKey, 'loading')

  const allProps = dependencies.getAllProps(entity)

  for (const prop of allProps) {
    const propName = prop.name
    const propDefinition = dependencies.getPropDefinitions(entity, propName)
    const sourcePropValue = sourceData[propName] ?? canonicalEntity[propName]

    if (Array.isArray(sourcePropValue)) {
      const listEntity = dependencies.getListEntityType(entity, propName)

      if (!listEntity) {
        canonicalEntity[propName] = sourcePropValue
        continue
      }

      canonicalEntity[propName] = sourcePropValue.map((item) =>
        hydrateEntityFromCache({
          entity: listEntity,
          data: item,
          cache,
          dependencies,
          visitState,
        }),
      )

      continue
    }

    const relationEntity = dependencies.getSourceByName(
      propDefinition?.type ?? '',
    )

    if (relationEntity && sourcePropValue) {
      canonicalEntity[propName] = hydrateEntityFromCache({
        entity: relationEntity,
        data: sourcePropValue,
        cache,
        dependencies,
        visitState,
      })

      continue
    }

    if (sourcePropValue !== undefined) {
      canonicalEntity[propName] = sourcePropValue
    }
  }

  visitState.set(cacheKey, 'loaded')
  return canonicalEntity
}
