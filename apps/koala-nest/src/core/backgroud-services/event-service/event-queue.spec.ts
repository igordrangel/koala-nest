import { Type } from '@nestjs/common'
import { vi } from 'vitest'
import { EventClass } from './event-class'
import { EventHandlerBase } from './event-handler.base'
import { EventJob } from './event-job'
import { EventQueue } from './event-queue'

class CustomEvent extends EventClass {}

class CustomEventHandler extends EventHandlerBase {
  constructor() {
    super(CustomEvent)
  }

  static async isCalled(): Promise<null> {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleEvent(event: CustomEvent): Promise<void> {
    await CustomEventHandler.isCalled()
  }
}

class CustomEventJob extends EventJob<any> {
  defineHandlers(): Array<Type<EventHandlerBase>> {
    return [CustomEventHandler]
  }
}

describe('event queue', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.spyOn(CustomEventHandler, 'isCalled')

    new CustomEventHandler().setupSubscriptions()

    const jobs = new CustomEventJob()
    jobs.addEvent(new CustomEvent())

    expect(jobs.eventQueue).toHaveLength(1)

    EventQueue.dispatchEventsForAggregate(jobs._id)

    expect(callbackSpy).toHaveBeenCalled()
    expect(jobs.eventQueue).toHaveLength(0)
  })
})
