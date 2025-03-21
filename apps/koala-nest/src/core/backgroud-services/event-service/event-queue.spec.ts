import { vi } from 'vitest'
import { EventClass } from './event-class'
import { EventJob } from './event-job'
import { EventQueue } from './event-queue'

class CustomEvent extends EventJob<any> {
  static create() {
    const aggregate = new CustomEvent()

    aggregate.addEvent(new CustomEventCreated(aggregate))

    return aggregate
  }
}

class CustomEventCreated extends EventClass<CustomEvent> {}

describe('event queue', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.fn()

    // Subscriber cadastrado (ouvindo o evento de "resposta criada")
    EventQueue.register(callbackSpy, CustomEventCreated.name)

    // Estou criando uma resposta porém SEM slvar no banco
    const aggregate = CustomEvent.create()

    // Estou assegurando que o evento foi criado porém NÃO foi disparado
    expect(aggregate.eventQueue).toHaveLength(1)

    // Estou salvando a resposta no banco de dados e assim disparando o evento
    EventQueue.dispatchEventsForAggregate(aggregate.id)

    // O subscriber ouve o evento e faz o que precisa ser feito com o dado
    expect(callbackSpy).toHaveBeenCalled()

    expect(aggregate.eventQueue).toHaveLength(0)
  })
})
