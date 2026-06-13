/// <reference types="bun-types/test-globals" />

import { EventClass } from '@/core/background-services/event-service/event-class';
import { EventHandlerBase } from '@/core/background-services/event-service/event-handler.base';
import { EventJob } from '@/core/background-services/event-service/event-job';
import { EventQueue } from '@/core/background-services/event-service/event-queue';
import { Type } from '@nestjs/common';
import { afterEach, describe, expect, it, spyOn } from 'bun:test';

class CustomEvent extends EventClass {}

class CustomEventHandler extends EventHandlerBase {
  constructor() {
    super(CustomEvent);
  }

  static async isCalled(): Promise<void> {
    return undefined;
  }

  async handleEvent(_event: CustomEvent): Promise<void> {
    await CustomEventHandler.isCalled();
  }
}

class CustomEventJob extends EventJob<unknown> {
  defineHandlers(): Array<Type<EventHandlerBase>> {
    return [CustomEventHandler];
  }
}

describe('EventQueue', () => {
  afterEach(() => {
    EventQueue.clearHandlers();
    EventQueue.clearMarkedAggregates();
  });

  it('dispara eventos e executa handlers registrados', () => {
    const callbackSpy = spyOn(CustomEventHandler, 'isCalled');

    new CustomEventHandler().setupSubscriptions();

    const jobs = new CustomEventJob();
    jobs.addEvent(new CustomEvent());

    expect(jobs.eventQueue).toHaveLength(1);

    EventQueue.dispatchEventsForAggregate(jobs._id);

    expect(callbackSpy).toHaveBeenCalled();
    expect(jobs.eventQueue).toHaveLength(0);
  });
});
