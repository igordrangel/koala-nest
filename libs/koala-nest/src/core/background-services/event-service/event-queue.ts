import { IComparableId } from '@/core/utils/icomparable';
import { EventClass } from './event-class';
import { EventJob } from './event-job';

type EventJobCallback = (event: EventClass) => void;

interface EventQueueJobItem {
  eventClassName: string;
  callback: EventJobCallback;
}

export class EventQueue {
  private static handlersMap: Record<string, EventQueueJobItem[]> = {};

  private static markedAggregates: EventJob<unknown>[] = [];

  static markAggregateForDispatch(aggregate: EventJob<unknown>) {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate._id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  static dispatchEventsForAggregate(id: IComparableId) {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearQueue();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  static register(
    callback: EventJobCallback,
    handlerClassName: string,
    eventClassName: string,
  ) {
    if (!(handlerClassName in this.handlersMap)) {
      this.handlersMap[handlerClassName] = [];
    }

    this.handlersMap[handlerClassName].push({
      eventClassName,
      callback,
    });
  }

  static clearHandlers() {
    this.handlersMap = {};
  }

  static clearMarkedAggregates() {
    this.markedAggregates = [];
  }

  static findMarkedAggregateByID(
    id: IComparableId,
  ): EventJob<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate._id === id);
  }

  static getMarkedAggregates() {
    return this.markedAggregates;
  }

  private static dispatchAggregateEvents(aggregate: EventJob<unknown>) {
    aggregate.eventQueue.forEach((event) => this.dispatch(event));
  }

  private static removeAggregateFromMarkedDispatchList(
    aggregate: EventJob<unknown>,
  ) {
    const index = this.markedAggregates.findIndex(
      (item) => item._id === aggregate._id,
    );

    this.markedAggregates.splice(index, 1);
  }

  private static dispatch(event: EventClass) {
    const eventJobHandlers = this.markedAggregates.find((aggregate) =>
      aggregate.eventQueue.find((queuedEvent) => queuedEvent === event),
    );

    const eventHandler = Object.keys(this.handlersMap).find((handlerName) =>
      eventJobHandlers
        ?.defineHandlers()
        .find(
          (handler) =>
            handler.name === handlerName &&
            this.handlersMap[handler.name].some(
              (job) => job.eventClassName === event.constructor.name,
            ),
        ),
    );

    if (eventHandler) {
      const jobs = this.handlersMap[eventHandler];

      for (const job of jobs) {
        job.callback(event);
      }
    }
  }
}
