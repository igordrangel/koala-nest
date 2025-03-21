import { AutoMappingList } from './auto-mapping-list'

export function AutoMap() {
  return function (object: Record<string, any>, propertyName: string): void {
    AutoMappingList.addMappedProp(object.constructor as any, propertyName)
  }
}
