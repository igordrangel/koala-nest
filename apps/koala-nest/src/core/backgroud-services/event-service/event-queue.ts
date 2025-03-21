import { IComparableId } from '../../../core/utils/interfaces/icomparable'
import { EventClass } from './event-class'
import { EventJob } from './event-job'

type EventJobCallback = (event: any) => void

export class EventQueue {
  private static handlersMap: Record<string, EventJobCallback[]> = {}
  private static markedAggregates: EventJob<any>[] = []

  public static markAggregateForDispatch(aggregate: EventJob<any>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.entity._id)

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
    const index = this.markedAggregates.findIndex((a) =>
      a.entity.equals(aggregate),
    )

    this.markedAggregates.splice(index, 1)
  }

  private static findMarkedAggregateByID(
    id: IComparableId,
  ): EventJob<any> | undefined {
    return this.markedAggregates.find(
      (aggregate) => aggregate.entity._id === id,
    )
  }

  private static dispatch(event: EventClass<any>) {
    const eventJobHandlers = this.markedAggregates.find((a) =>
      a.eventQueue.find((e) => e === event),
    )
    const eventHandler = Object.keys(this.handlersMap).find((handlerName) =>
      eventJobHandlers
        ?.defineHandlers()
        .find((handler) => handler.name === handlerName),
    )

    const isEventRegistered = !!eventHandler

    if (isEventRegistered) {
      const handlers = this.handlersMap[eventHandler]

      for (const handler of handlers) {
        handler(event)
      }
    }
  }
}
