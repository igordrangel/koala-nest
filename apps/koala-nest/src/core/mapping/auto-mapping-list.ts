import { Type } from '@nestjs/common'
import { List } from '../utils/list'
import { AutoMappingContext } from './auto-mapping-context'
import { AutoMappingClassContext } from './auto-mapping-class-context'

export class AutoMappingList {
  private static _mappedPropList = new List(AutoMappingClassContext)
  private static _mappingProfileList = new List(AutoMappingContext)

  static add(source: Type<any>, target: Type<any>) {
    this._mappingProfileList.add(new AutoMappingContext(source, target))
    this._mappedPropList.add(new AutoMappingClassContext(source))
    this._mappedPropList.add(new AutoMappingClassContext(target))
  }

  static get(source: Type<any>, target: Type<any>): AutoMappingContext | null {
    return this._mappingProfileList.find(
      (mp) => mp.source === source && mp.target === target,
    )
  }

  static addMappedProp(source: Type<any>, propName: string) {
    let mappedClass = this._mappedPropList.find((mp) => mp.source === source)

    if (!mappedClass) {
      mappedClass = new AutoMappingClassContext(source)
      this._mappedPropList.add(mappedClass)
    }

    mappedClass.props.add(propName)
  }
}
