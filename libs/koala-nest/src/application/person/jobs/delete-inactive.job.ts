import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { ReadManyPersonRequest } from '@/application/person/read-many/read-many-person.request';
import {
  CronJobHandlerBase,
  CronJobSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteInactiveJob extends CronJobHandlerBase {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly readManyPerson: ReadManyPersonHandler,
    private readonly deletePerson: DeletePersonHandler,
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
    const result = await this.readManyPerson.handle(
      Object.assign(new ReadManyPersonRequest(), { active: false }),
    );

    for (const person of result.items) {
      await this.deletePerson.handle(person.id);
    }
  }
}
