import { Type } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { vi } from 'vitest'
import { EntityBase } from '../../database/entity.base'
import { EventClass } from './event-class'
import { EventHandler } from './event-handler'
import { EventJob } from './event-job'
import { EventQueue } from './event-queue'

class ClassTest extends EntityBase<ClassTest> {
  id: string

  private _eventJobs = new CustomEventJob(this)

  get eventJobs() {
    return this._eventJobs
  }
}

class CustomEvent extends EventClass<any> {}

class CustomEventHandler extends EventHandler<CustomEvent> {
  static async isCalled(): Promise<null> {
    return null
  }

  async handleEvent(event: CustomEvent): Promise<void> {
    await CustomEventHandler.isCalled()
  }
}

class CustomEventJob extends EventJob<any> {
  defineHandlers(): Array<Type<EventHandler<any>>> {
    return [CustomEventHandler]
  }
}

describe('event queue', () => {
  it('should be able to dispatch and listen to events', () => {
    const callbackSpy = vi.spyOn(CustomEventHandler, 'isCalled')

    new CustomEventHandler().setupSubscriptions()

    const entity = new ClassTest()
    entity.automap({id: randomUUID()})
    entity.eventJobs.addEvent(CustomEvent)

    expect(entity.eventJobs.eventQueue).toHaveLength(1)

    EventQueue.dispatchEventsForAggregate(entity.id)
    
    expect(callbackSpy).toHaveBeenCalled()
    expect(entity.eventJobs.eventQueue).toHaveLength(0)
  })
})
