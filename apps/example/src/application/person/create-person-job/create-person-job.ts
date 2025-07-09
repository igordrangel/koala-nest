import { IPersonRepository } from '@/domain/repositories/iperson.repository'
import {
  CronJobHandlerBase,
  CronJobResponse,
  CronJobSettings,
} from '@koalarx/nest/core/backgroud-services/cron-service/cron-job.handler.base'
import { EventQueue } from '@koalarx/nest/core/backgroud-services/event-service/event-queue'
import { ok } from '@koalarx/nest/core/request-overflow/request-result'
import { ILoggingService } from '@koalarx/nest/services/logging/ilogging.service'
import { IRedLockService } from '@koalarx/nest/services/redlock/ired-lock.service'
import { Injectable } from '@nestjs/common'
import { CreatePersonHandler } from '../create/create-person.handler'
import { InactivePersonEvent } from '../events/inactive-person/inactive-person-event'
import { PersonEventJob } from '../events/person-event.job'

@Injectable()
export class CreatePersonJob extends CronJobHandlerBase {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly createPerson: CreatePersonHandler,
    private readonly repository: IPersonRepository,
  ) {
    super(redlockService, loggingService)
  }

  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1,
    }
  }

  protected async run(): Promise<CronJobResponse> {
    const result = await this.createPerson.handle({
      name: 'John Doe',
      phones: [{ phone: '22999999999' }],
      address: { address: 'Street 1' },
    })

    if (result.isOk()) {
      const person = await this.repository.read(result.value.id)

      if (person) {
        const jobs = new PersonEventJob()
        jobs.addEvent(new InactivePersonEvent())

        EventQueue.dispatchEventsForAggregate(jobs._id)
      }

      console.log('Person created with id:', result.value.id)
    } else {
      console.error('Error creating person:', result.value)
    }

    return ok(null)
  }
}
