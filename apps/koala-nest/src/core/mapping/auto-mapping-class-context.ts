import { Type } from '@nestjs/common'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { randomUUID } from 'crypto'

export interface AutoMappingClassProp {
  name: string
  type: () => Type<any> | ArrayConstructor
  compositionType?: () => Type<any> | ArrayConstructor
  compositionAction?: 'onlySet' | 'addTo'
}

export class AutoMappingClassContext
  implements IComparable<AutoMappingClassContext>
{
  _id: IComparableId
  source: Type<any>
  props = new List<AutoMappingClassProp>()

  constructor(source: Type<any>) {
    this._id = randomUUID()
    this.source = source
  }

  equals(obj: AutoMappingClassContext): boolean {
    return obj._id === this._id && this.source instanceof obj.source
  }
}
