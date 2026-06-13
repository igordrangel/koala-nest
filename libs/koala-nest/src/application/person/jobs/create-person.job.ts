import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import {
  CronJobHandlerBase,
  CronJobSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { EventQueue } from '@/core/background-services/event-service/event-queue';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { Injectable } from '@nestjs/common';
import { InactivePersonEvent } from '../events/inactive-person.event';
import { PersonEventJob } from '../events/person-event.job';

@Injectable()
export class CreatePersonJob extends CronJobHandlerBase {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly createPerson: CreatePersonHandler,
    private readonly repository: IPersonRepository,
  ) {
    super(redlockService, loggingService);
  }

  protected async settings(): Promise<CronJobSettings> {
    return {
      isActive: true,
      timeInMinutes: 1,
    };
  }

  protected async run(): Promise<void> {
    const created = await this.createPerson.handle({
      name: 'John Doe',
      contacts: [{ contact: '22999999999@example.com' }],
      address: { address: 'Street 1' },
    });

    const person = await this.repository.findById(created.id);

    if (person) {
      const jobs = new PersonEventJob();
      jobs.addEvent(new InactivePersonEvent());
      EventQueue.dispatchEventsForAggregate(jobs._id);
    }
  }
}
