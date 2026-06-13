import { Type } from '@nestjs/common';
import { EventClass } from './event-class';
import { EventQueue } from './event-queue';

export abstract class EventHandlerBase<TEvent extends EventClass = EventClass> {
  constructor(public readonly event: Type<TEvent>) {}

  abstract handleEvent(event: TEvent): Promise<void>;

  setupSubscriptions() {
    EventQueue.register(
      this.handleEvent.bind(this),
      this.constructor.name,
      this.event.name,
    );
  }
}
