import { AutoMap } from 'automapper-classes'
import { Optional } from '../@types'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'

export type EntityProps<T extends IComparable<T>> = Omit<
  Optional<T, 'id'>,
  'equals'
>

export abstract class Entity<T extends IComparable<T>>
  implements IComparable<T>
{
  @AutoMap()
  id: IComparableId

  protected create(props: EntityProps<T>) {
    Object.keys(props).forEach((key) => {
      if (Array.isArray(props[key]) && this[key] instanceof List) {
        this[key] = new List(props[key])
      } else {
        this[key] = props[key]
      }
    })
  }

  public equals(obj: Entity<T>): boolean {
    return obj.id === this.id
  }
}
