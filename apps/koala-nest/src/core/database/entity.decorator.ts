import { EntityBase } from './entity.base'

export function Entity<T extends new (...args: any[]) => EntityBase<any>>() {
  return function (target: T) {
    // Sobrescreve o comportamento do construtor
    const originalConstructor = target

    class NewConstructor extends target {
      constructor(...args: any[]) {
        super(...args) // Chama o construtor original

        // Chama o método `automap` se ele existir
        if (typeof this.automap === 'function') {
          this.automap(args[0])
        }
      }
    }

    const newConstructor: any = function (...args: any[]) {
      // Cria a instância usando Reflect.construct
      const instance = Reflect.construct(
        originalConstructor,
        args,
        newConstructor,
      )

      // Chama o método `automap` se ele existir
      if (typeof instance.automap === 'function') {
        instance.automap(args[0])
      }

      return instance
    }

    // Copia o protótipo e propriedades estáticas para o novo construtor
    Object.setPrototypeOf(NewConstructor.prototype, target.prototype)
    Object.setPrototypeOf(NewConstructor, target)

    // Define o nome do novo construtor para corresponder ao nome da classe original
    Object.defineProperty(NewConstructor, 'name', {
      value: target.name,
      writable: false,
    })

    return NewConstructor
  }
}
