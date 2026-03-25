import { KlArray, KlDate, KlTime } from '@koalarx/utils'
import { Type } from '@nestjs/common'
import { Overwrite } from '..'
import { AutoMappingList } from '../mapping/auto-mapping-list'
import {
  AutomapContext,
  createAutomapContext,
  mapEntityReference,
} from '../utils/automap-cycle-context'
import { IComparable, IComparableId } from '../utils/interfaces/icomparable'
import { List } from '../utils/list'
import { IdConfig } from './entity.decorator'

export enum EntityActionType {
  create = 1,
  update,
}

export type EntityProps<T extends IComparable<T>> = Overwrite<
  Omit<
    {
      [K in keyof T as T[K] extends Function ? never : K]: T[K]
    },
    | '_id'
    | '_action'
    | '_hasUpdate'
    | '_trackHasUpdateOnSet'
    | '_setTrackingProxy'
  >,
  { id?: T extends { id: infer U } ? U : never }
>

export abstract class EntityBase<
  T extends IComparable<T>,
> implements IComparable<T> {
  private _trackHasUpdateOnSet: boolean = false
  private _setTrackingProxy?: this

  _id: IComparableId
  _action: EntityActionType = EntityActionType.create
  _hasUpdate: boolean = false

  constructor(props?: EntityProps<T>) {
    Object.defineProperties(this, {
      _trackHasUpdateOnSet: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: false,
      },
      _setTrackingProxy: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: undefined,
      },
      _id: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: this._id,
      },
      _action: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: this._action,
      },
      _hasUpdate: {
        enumerable: false,
        configurable: true,
        writable: true,
        value: this._hasUpdate,
      },
    })

    if (props) {
      this.automap(props)
    }
  }

  protected startHasUpdateTracking() {
    this._trackHasUpdateOnSet = true
  }

  protected stopHasUpdateTracking() {
    this._trackHasUpdateOnSet = false
  }

  protected createSetTrackingProxy(): this {
    if (this._setTrackingProxy) {
      return this._setTrackingProxy
    }

    this._setTrackingProxy = new Proxy(this, {
      set: (target, property, value, receiver) => {
        const success = Reflect.set(target, property, value, receiver)

        if (
          success &&
          target._trackHasUpdateOnSet &&
          property !== '_hasUpdate' &&
          property !== '_action' &&
          property !== '_id' &&
          property !== '_trackHasUpdateOnSet' &&
          property !== '_setTrackingProxy'
        ) {
          target._hasUpdate = true
        }

        return success
      },
    }) as this

    return this._setTrackingProxy
  }

  automap(
    props?: EntityProps<T>,
    context: AutomapContext = createAutomapContext(),
  ) {
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
              return mapEntityReference(
                item,
                this[key].entityType as Type<any>,
                context,
                this._action,
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
            this[key] = mapEntityReference(
              props[key],
              EntityOnPropKey,
              context,
              this._action,
            )
          }
        } else if (propDefinitions) {
          if (key === 'id') {
            this._id = props[key] as IComparableId
          }

          this[key] = props[key]
        }
      }

      if (!this._id) {
        const idConfig = Reflect.getMetadata(
          'entity:id',
          this.constructor.prototype,
        ) as IdConfig<any>

        if (idConfig && idConfig.composite) {
          this._id = idConfig.composite
            .map((idPart) => this[idPart])
            .join('-') as IComparableId
        }
      }
    }
  }

  public equals(obj: EntityBase<T>): boolean {
    return obj._id === this._id
  }
}
