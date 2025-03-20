import { Type } from '@nestjs/common'
import { Optional } from '../@types'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'

export type EntityProps<T extends IComparable<T>> = Omit<
  Optional<T, '_id'>,
  'equals'
>

export abstract class Entity<T extends IComparable<T>>
  implements IComparable<T>
{
  _id: IComparableId

  protected automap(props: EntityProps<T>) {
    Object.keys(props ?? {}).forEach((key) => {
      if (Array.isArray(props[key]) && this[key] instanceof List) {
        let value: any = props[key]

        if (this[key].entityType) {
          value = value.map(
            (item) => new (this[key].entityType as Type<T>)(item),
          )
        }

        this[key].setList(value)
      } else {
        if (key === 'id') {
          this._id = props[key] as IComparableId
        }

        this[key] = props[key]
      }
    })
  }

  public equals(obj: Entity<T>): boolean {
    return obj._id === this._id
  }
}
