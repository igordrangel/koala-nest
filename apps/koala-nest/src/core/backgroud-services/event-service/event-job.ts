import { Type } from '@nestjs/common'
import { EventClass } from './event-class'
import { EventHandlerBase } from './event-handler.base'
import { EventQueue } from './event-queue'
import { randomUUID } from 'node:crypto'

export abstract class EventJob<TEntity> {
  _id = randomUUID()

  private _eventQueue: EventQueue[] = []

  constructor() {}

  abstract defineHandlers(): Array<Type<EventHandlerBase>>

  get eventQueue(): EventQueue[] {
    return this._eventQueue
  }

  public clearQueue() {
    this._eventQueue = []
  }

  public addEvent(event: EventClass<TEntity>): void {
    this.eventQueue.push(event)
    EventQueue.markAggregateForDispatch(this)
  }
}
