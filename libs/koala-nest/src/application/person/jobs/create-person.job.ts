import { DemoCronExpression } from '@/core/constants/cron.constants';
import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import {
  CronJobHandlerBase,
  CronJobSettings,
  demoCronSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { EventQueue } from '@/core/background-services/event-service/event-queue';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { Injectable, Logger } from '@nestjs/common';
import { InactivePersonEvent } from '../events/inactive-person.event';
import { PersonEventJob } from '../events/person-event.job';

@Injectable()
export class CreatePersonJob extends CronJobHandlerBase {
  private readonly logger = new Logger(CreatePersonJob.name);

  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly createPerson: CreatePersonHandler,
    private readonly repository: IPersonRepository,
  ) {
    super(redlockService, loggingService);
  }

  protected settings(): Promise<CronJobSettings> {
    return Promise.resolve(demoCronSettings(DemoCronExpression.HOURLY));
  }

  protected async run(): Promise<void> {
    this.logger.debug('Iniciando criação de pessoa...');

    const created = await this.createPerson.handle({
      name: 'John Doe',
      contacts: [{ contact: '22999999999@example.com' }],
      address: { address: 'Street 1' },
    });

    const person = await this.repository.findById(created.id);

    if (person) {
      this.logger.log(`Pessoa criada com sucesso. ID: ${person.id}`);

      const jobs = new PersonEventJob();
      jobs.addEvent(new InactivePersonEvent());
      EventQueue.dispatchEventsForAggregate(jobs._id);

      this.logger.log('Evento de inativação disparado.');
    } else {
      this.logger.log('Pessoa não encontrada após criação.');
    }

    this.logger.log('Job concluído.');
  }
}
