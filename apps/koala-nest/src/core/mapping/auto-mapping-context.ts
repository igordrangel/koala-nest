import { Type } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'

export class AutoMappingContext implements IComparable<AutoMappingContext> {
  _id: IComparableId
  source: Type<any>
  target: Type<any>

  constructor(source: Type<any>, target: Type<any>) {
    this._id = randomUUID()
    this.source = source
    this.target = target
  }

  equals(obj: AutoMappingContext): boolean {
    return (
      obj._id === this._id &&
      this.source instanceof obj.source &&
      this.target instanceof obj.target
    )
  }
}
