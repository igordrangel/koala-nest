import { Type } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EventClass } from './event-class';
import { EventHandlerBase } from './event-handler.base';
import { EventQueue } from './event-queue';

export abstract class EventJob<TEntity> {
  private _eventQueue: EventClass<TEntity>[] = [];

  _id = randomUUID();

  /**
   * Lista os handlers que processam eventos deste agregado.
   * Usado pelo `EventQueue.dispatch` para rotear eventos enfileirados.
   * Registre as mesmas classes em `JobsModule.register({ eventHandlers })`.
   */
  abstract defineHandlers(): Array<Type<EventHandlerBase>>;

  get eventQueue(): EventClass<TEntity>[] {
    return this._eventQueue;
  }

  clearQueue() {
    this._eventQueue = [];
  }

  addEvent(event: EventClass<TEntity>): void {
    this._eventQueue.push(event);
    EventQueue.markAggregateForDispatch(this);
  }
}
