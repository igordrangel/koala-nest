import { Entity } from '../../../core/database/entity'
import { IComparable } from '../../../core/utils/interfaces/icomparable'
import { EventClass } from './event-class'
import { EventQueue } from './event-queue'

export class EventJob<TEntity extends IComparable> extends Entity<TEntity> {
  private _eventQueue: EventQueue[] = []

  get eventQueue(): EventQueue[] {
    return this._eventQueue
  }

  public clearQueue() {
    this._eventQueue = []
  }

  public addEvent(event: EventClass<EventJob<TEntity>>): void {
    this.eventQueue.push(event)
    EventQueue.markAggregateForDispatch(this)
  }
}
