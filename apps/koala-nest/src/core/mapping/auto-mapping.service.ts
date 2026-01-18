import { Injectable, Type } from '@nestjs/common'
import { getTypeByProp } from '../utils/get-type-by-prop'
import { List } from '../utils/list'
import { AutoMappingList } from './auto-mapping-list'
import { AutoMappingProfile } from './auto-mapping-profile'

@Injectable()
export class AutoMappingService {
  private readonly _contextList = AutoMappingList

  constructor(automappingProfile: AutoMappingProfile) {
    automappingProfile.profile()
  }

  private getInstanceType(
    prop: () => Type<any> | ArrayConstructor,
  ): Type<any> | ArrayConstructor {
    try {
      return prop() ?? prop
    } catch {
      return prop as any
    }
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
          const typeSource = getTypeByProp(propSource)
          const typeTarget = getTypeByProp(targetProp)

          const listToArray =
            typeSource === List.name &&
            typeTarget === Array.name &&
            value instanceof List

          const arrayToList =
            typeSource === Array.name &&
            typeTarget === List.name &&
            value instanceof Array &&
            !!compositionType

          const arrayToArray =
            typeSource === Array.name &&
            typeTarget === Array.name &&
            value instanceof Array &&
            !!compositionType

          let mappedValue = value

          if (listToArray) {
            mappedValue = this.mapListToArray(value)
          } else if (arrayToList) {
            mappedValue = this.mapArrayToList(
              value,
              this.getInstanceType(compositionType),
              compositionAction === 'onlySet',
            )
          } else if (arrayToArray) {
            mappedValue = this.mapArrayToArray(
              value,
              this.getInstanceType(compositionType),
            )
          } else {
            const propSourceInstance =
              this._contextList.getSourceByName(typeSource)
            if (propSourceInstance) {
              mappedValue = this.mapNestedProp(value, propSourceInstance)
            }
          }

          mappedTarget[targetProp.name] = mappedValue
        }
      }
    })

    propTargetContext?.props.forEach((prop) => {
      const formMemberDefinition = mapContext.forMemberDifinitions?.find(
        (def) => def[prop.name],
      )?.[prop.name]

      if (formMemberDefinition) {
        mappedTarget[prop.name] = formMemberDefinition(data)
      }
    })

    return mappedTarget
  }

  private getTarget(data: any, source: Type<any>) {
    if (this.isPrimitiveType(data)) {
      return data
    }

    const targets = this._contextList.getTargets(source.prototype.constructor)

    if (targets.length === 0) {
      throw new Error(`No mapping context found for ${source.name}`)
    }

    return targets[0]
  }

  private mapNestedProp(data: any, source: Type<any>) {
    return this.map(
      data,
      source.prototype.constructor,
      this.getTarget(data, source),
    )
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
    const list = new List(
      this.getTarget(value, compositionType.prototype.constructor),
    )

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

  private mapArrayToArray(value: Array<any>, compositionType: Type<any>) {
    return value.map(
      (item) =>
        this.mapNestedProp(item, compositionType.prototype.constructor) ?? {},
    )
  }

  private isPrimitiveType(value: any) {
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'bigint':
      case 'boolean':
        return true
      case 'symbol':
      case 'undefined':
      case 'object':
      case 'function':
        return false
    }
  }
}
