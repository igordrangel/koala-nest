import { Type } from '@nestjs/common'

export interface AutomapContext {
  references: WeakMap<object, any>
}

export function createAutomapContext(): AutomapContext {
  return {
    references: new WeakMap<object, any>(),
  }
}

export function mapEntityReference(
  value: any,
  EntityOnPropKey: Type<any>,
  context: AutomapContext,
  action: number,
) {
  if (!value || typeof value !== 'object') {
    return value
  }

  const cachedEntity = context.references.get(value)

  if (cachedEntity) {
    return cachedEntity
  }

  const DecoratedEntityConstructor =
    Reflect.getMetadata(
      'entity:decorated-constructor',
      EntityOnPropKey.prototype,
    ) ?? EntityOnPropKey

  const entity = new DecoratedEntityConstructor()
  const trackedEntity = entity as any

  if (entity && typeof (entity as any).automap === 'function') {
    if (typeof trackedEntity.stopHasUpdateTracking === 'function') {
      trackedEntity.stopHasUpdateTracking()
    }

    trackedEntity._action = action
    context.references.set(value, entity)
    trackedEntity.automap(value, context)

    if (typeof trackedEntity.startHasUpdateTracking === 'function') {
      trackedEntity.startHasUpdateTracking()
    }
  }

  return entity
}
