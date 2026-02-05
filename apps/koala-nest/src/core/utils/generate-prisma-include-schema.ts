import { Type } from '@nestjs/common'
import { EntityBase } from '../database/entity.base'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import { List } from './list'

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
  const props = AutoMappingList.getAllProps(entity)
  const entityInstance = new entity()

  props.forEach((prop) => {
    let instance

    try {
      instance = new (prop.type())()
    } catch {
      instance = null
    }

    let includes

    if (instance instanceof List) {
      if (forList) {
        includeSchema[prop.name] = true
      } else {
        includes = generateIncludeSchema({
          forList,
          entity: instance.entityType! as any,
          deepLimit,
          deepIncludeCount: deepIncludeCount > 0 ? deepIncludeCount + 1 : 1,
        })
      }
    } else {
      const propDefinitions = AutoMappingList.getPropDefinitions(
        entityInstance.constructor as any,
        prop.name,
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
        includeSchema[prop.name] = includes
      } else {
        includeSchema[prop.name] = true
      }
    }
  })

  return includeSchema
}
