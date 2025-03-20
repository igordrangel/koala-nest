import { IComparableId } from '../../../core/utils/interfaces/icomparable'
import { EventClass } from './event-class'
import { EventJob } from './event-job'

type EventJobCallback = (event: any) => void

export class EventQueue {
  private static handlersMap: Record<string, EventJobCallback[]> = {}
  private static markedAggregates: EventJob<any>[] = []

  public static markAggregateForDispatch(aggregate: EventJob<any>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate._id)

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate)
    }
  }

  public static dispatchEventsForAggregate(id: IComparableId) {
    const aggregate = this.findMarkedAggregateByID(id)

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate)
      aggregate.clearQueue()
      this.removeAggregateFromMarkedDispatchList(aggregate)
    }
  }

  public static register(callback: EventJobCallback, eventClassName: string) {
    const wasEventRegisteredBefore = eventClassName in this.handlersMap

    if (!wasEventRegisteredBefore) {
      this.handlersMap[eventClassName] = []
    }

    this.handlersMap[eventClassName].push(callback)
  }

  public static clearHandlers() {
    this.handlersMap = {}
  }

  public static clearMarkedAggregates() {
    this.markedAggregates = []
  }

  private static dispatchAggregateEvents(aggregate: EventJob<any>) {
    aggregate.eventQueue.forEach((event: EventClass<any>) =>
      this.dispatch(event),
    )
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: EventJob<any>,
  ) {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate))

    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(
    id: IComparableId,
  ): EventJob<any> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate._id === id)
  }

  private static dispatch(event: EventClass<any>) {
    const eventClassName: string = event.constructor.name

    const isEventRegistered = eventClassName in this.handlersMap

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventClassName]

      for (const handler of handlers) {
        handler(event)
      }
    }
  }
}
