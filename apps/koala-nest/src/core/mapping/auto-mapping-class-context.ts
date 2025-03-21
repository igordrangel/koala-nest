import { Type } from '@nestjs/common'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { randomUUID } from 'crypto'

export class AutoMappingClassContext
  implements IComparable<AutoMappingClassContext>
{
  _id: IComparableId
  source: Type<any>
  props = new List<{
    name: string
    type: any
    compositionType?: Type<any>
    compositionAction?: 'onlySet' | 'addTo'
  }>()

  constructor(source: Type<any>) {
    this._id = randomUUID()
    this.source = source
  }

  equals(obj: AutoMappingClassContext): boolean {
    return obj._id === this._id && this.source instanceof obj.source
  }
}
