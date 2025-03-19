import { EventClass } from './event-class'
import { EventQueue } from './event-queue'

export abstract class EventHandler<TEventJob> {
  setupSubscriptions() {
    EventQueue.register(this.handleEvent.bind(this), this.constructor.name)
  }

  abstract handleEvent(event: EventClass<TEventJob>): Promise<void>
}
