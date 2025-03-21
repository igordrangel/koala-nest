import { Type } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { ForMemberDefinition } from './for-member'

export class AutoMappingContext implements IComparable<AutoMappingContext> {
  _id: IComparableId

  constructor(
    public source: Type<any>,
    public target: Type<any>,
    public forMemberDifinitions: ForMemberDefinition<any, any>,
  ) {
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
