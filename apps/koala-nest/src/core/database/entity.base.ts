import { Type } from '@nestjs/common'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'

export type EntityProps<T extends IComparable<T>> = Omit<{
  [K in keyof T as T[K] extends Function ? never : K]: T[K]
}, '_id'>

export abstract class EntityBase<T extends IComparable<T>>
  implements IComparable<T>
{
  _id: IComparableId

  constructor(props?: EntityProps<T>) {
    if (props) {
      this.automap(props)
    }
  }

  automap(props: EntityProps<T>) {
    Object.keys(props ?? {}).forEach((key) => {
      if (Array.isArray(props[key]) && this[key] instanceof List) {
        let value: any = props[key]

        if (this[key].entityType) {
          value = value.map((item) => {
            const entity = new (this[key].entityType as Type<EntityBase<T>>)()
            entity.automap(item)

            return entity
          })
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

  public equals(obj: EntityBase<T>): boolean {
    return obj._id === this._id
  }
}
