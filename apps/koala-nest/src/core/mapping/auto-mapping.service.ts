import { Injectable, Type } from '@nestjs/common'
import { List } from '../utils/list'
import { AutoMappingList } from './auto-mapping-list'
import { AutoMappingProfile } from './auto-mapping-profile'

@Injectable()
export class AutoMappingService {
  private readonly _contextList = AutoMappingList

  constructor(automappingProfile: AutoMappingProfile) {
    automappingProfile.profile()
  }

  map<S, T>(data: any, source: Type<S>, target: Type<T>): T {
    const { mapContext, propSourceContext, propTargetContext } =
      this._contextList.get(source, target)

    if (!mapContext) {
      throw new Error(
        `No mapping context found for ${source.name} to ${target.name}`,
      )
    }

    const mappedTarget = new target.prototype.constructor()

    propSourceContext?.props.forEach((propSource) => {
      const value = data[propSource.name]
      const compositionType = propSource.compositionType
      const compositionAction = propSource.compositionAction

      if (value !== undefined) {
        const targetProp = propTargetContext?.props.find(
          (tp) => tp.name === propSource.name,
        )

        if (targetProp) {
          const listToArray =
            propSource.type === List.name &&
            targetProp.type === Array.name &&
            value instanceof List

          const arrayToList =
            propSource.type === Array.name &&
            targetProp.type === List.name &&
            value instanceof Array &&
            !!compositionType

          let mappedValue = value

          if (listToArray) {
            mappedValue = this.mapListToArray(value)
          } else if (arrayToList) {
            mappedValue = this.mapArrayToList(
              value,
              compositionType,
              compositionAction === 'onlySet',
            )
          } else {
            const propSourceInstance = this._contextList.getSourceByName(
              propSource.type,
            )
            if (propSourceInstance) {
              mappedValue = this.mapNestedProp(value, propSourceInstance)
            }
          }

          mappedTarget[targetProp.name] = mappedValue
        }
      }
    })

    Object.keys(mappedTarget).forEach((key) => {
      const formMemberDefinition = mapContext.forMemberDifinitions?.find(
        (def) => def[key],
      )?.[key]

      if (formMemberDefinition) {
        mappedTarget[key] = formMemberDefinition(data)
      }
    })

    return mappedTarget
  }

  private mapNestedProp(data: any, source: Type<any>) {
    const targets = this._contextList.getTargets(source.prototype.constructor)

    if (targets.length >= 1) {
      return this.map(data, source.prototype.constructor, targets[0])
    }
  }

  private mapListToArray(value: List<any>) {
    return value.toArray().map((item) => {
      const entityOnList = value.entityType?.prototype.constructor

      if (entityOnList) {
        return this.mapNestedProp(item, entityOnList) ?? {}
      }

      return {}
    })
  }

  private mapArrayToList(
    value: Array<any>,
    compositionType: Type<any>,
    onlySet = true,
  ) {
    const list = new List(compositionType.prototype.constructor)

    const mappedValue = value.map(
      (item) =>
        this.mapNestedProp(item, compositionType.prototype.constructor) ?? {},
    )

    if (onlySet) {
      list.setList(mappedValue)
    } else {
      list.update(mappedValue)
    }

    return list
  }
}
