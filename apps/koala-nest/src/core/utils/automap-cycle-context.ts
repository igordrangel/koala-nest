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

  const entity = new EntityOnPropKey()

  if (entity && typeof (entity as any).automap === 'function') {
    ;(entity as any)._action = action
    context.references.set(value, entity)
    ;(entity as any).automap(value, context)
  }

  return entity
}
