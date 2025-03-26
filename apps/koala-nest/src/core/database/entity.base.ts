import { Type } from '@nestjs/common'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'

export type EntityProps<T extends IComparable<T>> = Omit<
  {
    [K in keyof T as T[K] extends Function ? never : K]: T[K]
  },
  '_id'
>

export abstract class EntityBase<T extends IComparable<T>>
  implements IComparable<T>
{
  _id: IComparableId

  automap(props?: EntityProps<T>) {
    if (props) {
      for (const key of Object.keys(props)) {
        const propDefinitions = AutoMappingList.getPropDefinitions(
          this.constructor.prototype.constructor,
          key,
        )
        const EntityOnPropKey = AutoMappingList.getSourceByName(
          propDefinitions?.type,
        )

        if (Array.isArray(props[key]) && this[key] instanceof List) {
          let value: any = props[key]

          if (this[key].entityType) {
            value = value.map((item) => {
              const entity = new (this[key].entityType as Type<any>)()
              entity.automap(item)

              return entity
            })
          }

          this[key].setList(value)
        } else if (EntityOnPropKey) {
          const entity = new EntityOnPropKey()
          entity.automap(props[key])

          this[key] = entity
        } else if (propDefinitions) {
          if (key === 'id') {
            this._id = props[key] as IComparableId
          }

          this[key] = props[key]
        }
      }
    }
  }

  public equals(obj: EntityBase<T>): boolean {
    return obj._id === this._id
  }
}
