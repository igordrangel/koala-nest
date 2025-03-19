import { AutoMap } from 'automapper-classes'
import { Optional } from '../@types'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'

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
    Object.assign(this, props)
  }

  public equals(obj: Entity<T>): boolean {
    return obj.id === this.id
  }
}
