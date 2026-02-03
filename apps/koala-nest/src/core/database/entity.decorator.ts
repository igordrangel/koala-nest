import { EntityBase } from './entity.base'

type EntityProps<T> = Omit<
  {
    [K in keyof T as T[K] extends Function ? never : K]: T[K]
  },
  '_id' | '_action'
>

export type CompositeId = readonly (string | number)[]

export interface IdConfig<T extends EntityProps<any>> {
  // ID simples
  single?: keyof T
  // ID composto (para relacionamentos n:n)
  composite?: readonly (keyof T)[]
  // Função customizada para gerar/resolver o ID
  custom?: (props: T) => string | number | CompositeId
}

function normalizeIdConfig<T extends EntityProps<any>>(
  id?: keyof T | IdConfig<T>,
): IdConfig<T> | undefined {
  if (!id) return undefined
  if (typeof id === 'string' || typeof id === 'symbol') {
    return { single: id }
  }
  return id as IdConfig<T>
}

export function Entity<T extends new (...args: any[]) => EntityBase<any>>(
  id?:
    | keyof EntityProps<InstanceType<T>>
    | IdConfig<EntityProps<InstanceType<T>>>,
) {
  return function (target: T) {
    class NewConstructor extends target {
      constructor(...args: any[]) {
        super(...args) // Chama o construtor original

        // Chama o método `automap` se ele existir
        if (typeof this.automap === 'function') {
          this.automap(args[0])
        }
      }
    }

    // Copia o protótipo e propriedades estáticas para o novo construtor
    Object.setPrototypeOf(NewConstructor.prototype, target.prototype)
    Object.setPrototypeOf(NewConstructor, target)

    // Define o nome do novo construtor para corresponder ao nome da classe original
    Object.defineProperty(NewConstructor, 'name', {
      value: target.name,
      writable: false,
    })

    const idConfig = normalizeIdConfig(id)
    Reflect.defineMetadata('entity:id', idConfig, NewConstructor.prototype)

    return NewConstructor
  }
}
