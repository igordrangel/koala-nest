import { Type } from '@nestjs/common'
import { EventClass } from './event-class'
import { EventQueue } from './event-queue'

export abstract class EventHandlerBase {
  constructor(public readonly event: Type<EventClass>) {}

  setupSubscriptions() {
    EventQueue.register(
      this.handleEvent.bind(this),
      this.constructor.name,
      this.event.name,
    )
  }

  abstract handleEvent(event: typeof this.event): Promise<void>
}
