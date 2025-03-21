import { EventClass } from './event-class'
import { EventQueue } from './event-queue'

export abstract class EventHandler<TEvent extends EventClass<any>> {
  setupSubscriptions() {
    EventQueue.register(this.handleEvent.bind(this), this.constructor.name)
  }

  abstract handleEvent(event: TEvent): Promise<void>
}
