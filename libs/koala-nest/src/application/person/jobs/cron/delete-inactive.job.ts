import { CronExpression } from '@/core/constants/cron.constants';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import {
  CronJobHandlerBase,
  CronJobSettings,
  cronJobSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable, Logger } from '@nestjs/common';

const DELETE_INACTIVE_BATCH_SIZE = 100;

@Injectable()
export class DeleteInactiveJob extends CronJobHandlerBase {
  private readonly logger = new Logger(DeleteInactiveJob.name);

  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly repository: IPersonRepository,
    private readonly deletePerson: DeletePersonHandler,
  ) {
    super(redlockService, loggingService);
  }

  protected settings(): Promise<CronJobSettings> {
    return Promise.resolve(cronJobSettings(CronExpression.EVERY_15_SECONDS));
  }

  protected async run(): Promise<void> {
    this.logger.debug('Iniciando remoção de pessoas inativas...');

    let page = 0;
    let totalDeleted = 0;

    while (true) {
      const query = PersonQueryDto.from({
        active: false,
        page,
        limit: DELETE_INACTIVE_BATCH_SIZE,
      });
      const { items, count } = await this.repository.findMany(query);

      if (items.length === 0) {
        break;
      }

      this.logger.debug('Removendo pessoas inativas...', items.length);

      for (const person of items) {
        await this.deletePerson.handle(person.id);
      }

      totalDeleted += items.length;
      page += 1;

      if (page * DELETE_INACTIVE_BATCH_SIZE >= count) {
        break;
      }
    }

    if (totalDeleted === 0) {
      this.logger.log('Nenhuma pessoa inativa encontrada.');
      this.logger.log('Job concluído sem ação.');
      return;
    }

    this.logger.log('Pessoas inativas removidas com sucesso.', totalDeleted);
    this.logger.log('Job concluído.');
  }
}
