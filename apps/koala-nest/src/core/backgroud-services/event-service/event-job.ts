import { Type } from '@nestjs/common'
import { EventClass } from './event-class'
import { EventHandler } from './event-handler'
import { EventQueue } from './event-queue'

export abstract class EventJob<TEntity> {
  private _eventQueue: EventQueue[] = []

  constructor(public readonly entity: TEntity) {}

  abstract defineHandlers(): Array<Type<EventHandler<any>>>

  get eventQueue(): EventQueue[] {
    return this._eventQueue
  }

  public clearQueue() {
    this._eventQueue = []
  }

  public addEvent(Event: Type<EventClass<TEntity>>): void {
    this.eventQueue.push(new Event(this))
    EventQueue.markAggregateForDispatch(this)
  }
}
