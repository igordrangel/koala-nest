import { AutoMappingClassProp } from '../mapping/auto-mapping-class-context'

export function getTypeByProp(prop: AutoMappingClassProp) {
  try {
    return prop.type().name ?? prop.type.name ?? ''
  } catch {
    return prop.type.name ?? ''
  }
}
