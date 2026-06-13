import { DemoCronExpression } from '@/core/constants/cron.constants';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request';
import {
  CronJobHandlerBase,
  CronJobSettings,
  demoCronSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class DeleteInactiveJob extends CronJobHandlerBase {
  private readonly logger = new Logger(DeleteInactiveJob.name);

  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly readManyPerson: ReadManyPersonHandler,
    private readonly deletePerson: DeletePersonHandler,
  ) {
    super(redlockService, loggingService);
  }

  protected settings(): Promise<CronJobSettings> {
    return Promise.resolve(demoCronSettings(DemoCronExpression.HOURLY));
  }

  protected async run(): Promise<void> {
    this.logger.debug('Iniciando remoção de pessoas inativas...');

    const result = await this.readManyPerson.handle(
      Object.assign(new ReadManyPersonRequest(), { active: false }),
    );

    if (result.items.length === 0) {
      this.logger.log('Nenhuma pessoa inativa encontrada.');
      this.logger.log('Job concluído sem ação.');
      return;
    }

    this.logger.debug('Removendo pessoas inativas...', result.items.length);

    for (const person of result.items) {
      await this.deletePerson.handle(person.id);
    }

    this.logger.log(
      'Pessoas inativas removidas com sucesso.',
      result.items.length,
    );
    this.logger.log('Job concluído.');
  }
}
