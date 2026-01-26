import { Type } from '@nestjs/common'
import { EntityBase } from '../database/entity.base'
import { List } from './list'
import { AutoMappingList } from '../mapping/auto-mapping-list'

export interface GeneratePrismaIncludeSchemaOptions {
  entity: Type<EntityBase<any>>
  deepLimit: number
  deepIncludeCount?: number
  forList?: boolean
}

export function generateIncludeSchema({
  forList,
  entity,
  deepIncludeCount = 0,
  deepLimit,
}: GeneratePrismaIncludeSchemaOptions) {
  if (deepIncludeCount >= deepLimit) {
    return true
  }

  const includeSchema = {}
  const entityInstance = new entity()

  Object.keys(entityInstance)
    .filter((key) => !['_id', '_action'].includes(key))
    .forEach((key) => {
      let includes

      if (entityInstance[key] instanceof List) {
        if (forList) {
          includeSchema[key] = true
        } else {
          includes = generateIncludeSchema({
            forList,
            entity: entityInstance[key].entityType! as any,
            deepLimit,
            deepIncludeCount: deepIncludeCount > 0 ? deepIncludeCount + 1 : 1,
          })
        }
      } else {
        const propDefinitions = AutoMappingList.getPropDefinitions(
          entityInstance.constructor as any,
          key,
        )

        if (propDefinitions) {
          const source = AutoMappingList.getSourceByName(propDefinitions.type)

          if (source?.prototype instanceof EntityBase) {
            includes = generateIncludeSchema({
              forList,
              entity: source,
              deepLimit,
              deepIncludeCount: deepIncludeCount > 0 ? deepIncludeCount + 1 : 1,
            })
          }
        }
      }

      if (includes) {
        if (includes === true || Object.keys(includes).length > 0) {
          includeSchema[key] = includes
        } else {
          includeSchema[key] = true
        }
      }
    })

  return includeSchema
}
