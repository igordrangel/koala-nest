import { Type } from '@nestjs/common'
import { AutoMappingList } from './auto-mapping-list'

interface AutoMapConfig<T> {
  type?: Type<T>
  isArray?: boolean | { addTo: boolean }
}

export function AutoMap<T>(config?: AutoMapConfig<T>) {
  return function (target: any, propertyKey: string) {
    const customMetadata = config?.type
    const isArray = config?.isArray

    if (customMetadata) {
      if (isArray) {
        Reflect.defineMetadata(
          'composition:type',
          customMetadata,
          target,
          propertyKey,
        )
        Reflect.defineMetadata(
          'composition:action',
          `${isArray === true || !isArray.addTo ? 'onlySet' : 'addTo'}`,
          target,
          propertyKey,
        )
      } else {
        Reflect.defineMetadata(
          'design:type',
          customMetadata,
          target,
          propertyKey,
        )
      }
    }

    AutoMappingList.addMappedProp(target.constructor, propertyKey)
  }
}
