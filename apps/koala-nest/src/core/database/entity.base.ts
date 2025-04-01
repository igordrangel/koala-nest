import { Type } from '@nestjs/common'
import { Overwrite } from '..'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { PersonAddress } from './entity.decorator.spec'

export enum EntityActionType {
  create = 1,
  update,
}

export type EntityProps<T extends IComparable<T>> = Overwrite<
  Omit<
    {
      [K in keyof T as T[K] extends Function ? never : K]: T[K]
    },
    '_id' | '_action'
  >,
  { id?: T extends { id: infer U } ? U : never }
>

export abstract class EntityBase<T extends IComparable<T>>
  implements IComparable<T>
{
  _id: IComparableId
  _action: EntityActionType = EntityActionType.create

  constructor(props?: EntityProps<T>) {
    if (props) {
      this.automap(props)
    }
  }

  automap(props?: EntityProps<T>) {
    if (props) {
      for (const key of Object.keys(props)) {
        if (props[key] === undefined) {
          continue
        }

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
              entity._action = this._action
              entity.automap(item)

              return entity
            })
          }

          this[key].setList(value)
        } else if (EntityOnPropKey) {
          if (props[key]) {
            const entity = new EntityOnPropKey()
            entity._action = this._action
            entity.automap(props[key])

            this[key] = entity
          }
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
