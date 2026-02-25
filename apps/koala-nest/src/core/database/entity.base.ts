import { KlArray, KlDate, KlTime } from '@koalarx/utils'
import { Type } from '@nestjs/common'
import { Overwrite } from '..'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'

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

export abstract class EntityBase<
  T extends IComparable<T>,
> implements IComparable<T> {
  _id: IComparableId
  _action: EntityActionType = EntityActionType.create

  constructor(props?: EntityProps<T>) {
    if (props) {
      this.automap(props)
    }
  }

  private createAutomapContext() {
    return {
      references: new WeakMap<object, any>(),
    }
  }

  private mapEntityReference(
    value: any,
    EntityOnPropKey: Type<any>,
    context: ReturnType<typeof this.createAutomapContext>,
  ) {
    if (!value || typeof value !== 'object') {
      return value
    }

    const cachedEntity = context.references.get(value)

    if (cachedEntity) {
      return cachedEntity
    }

    const entity = new EntityOnPropKey()

    if (entity instanceof EntityBase) {
      entity._action = this._action
      context.references.set(value, entity)
      entity.automap(value as any, context as any)
    }

    return entity
  }

  automap(props?: EntityProps<T>, context = this.createAutomapContext()) {
    if (props) {
      if (typeof props === 'object' && props !== null) {
        const cachedInstance = context.references.get(props as object)

        if (cachedInstance && cachedInstance !== this) {
          return
        }

        context.references.set(props as object, this)
      }

      for (const key of Object.keys(props)) {
        if (props[key] === undefined) {
          continue
        }

        const propDefinitions = AutoMappingList.getPropDefinitions(
          this.constructor.prototype.constructor,
          key,
        )
        const EntityOnPropKey = AutoMappingList.getSourceByName(
          propDefinitions?.type ?? '',
        )

        if (Array.isArray(props[key]) && this[key] instanceof List) {
          let value: any = props[key]

          if (this[key].entityType) {
            value = value.map((item) => {
              return this.mapEntityReference(
                item,
                this[key].entityType as Type<any>,
                context,
              )
            })
          }

          this[key].setList(value)
        } else if (
          propDefinitions?.type === 'KlArray' &&
          (props[key] instanceof Array || Array.isArray(props[key]))
        ) {
          this[key] = new KlArray(props[key])
        } else if (
          propDefinitions?.type === 'KlDate' &&
          props[key] instanceof Date
        ) {
          this[key] = new KlDate(props[key])
        } else if (
          propDefinitions?.type === 'KlTime' &&
          props[key] instanceof Date
        ) {
          this[key] = new KlTime(
            props[key].getHours(),
            props[key].getMinutes(),
            props[key].getSeconds(),
            props[key].getMilliseconds(),
          )
        } else if (EntityOnPropKey) {
          if (props[key]) {
            this[key] = this.mapEntityReference(
              props[key],
              EntityOnPropKey,
              context,
            )
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
