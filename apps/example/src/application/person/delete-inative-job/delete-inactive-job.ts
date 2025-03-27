import { ReadManyPersonDto } from '@/domain/dtos/read-many-person.dto'
import {
  CronJobHandler,
  CronJobResponse,
} from '@koalarx/nest/core/backgroud-services/cron-service/cron-job.handler.base'
import { ok } from '@koalarx/nest/core/request-overflow/request-result'
import { ILoggingService } from '@koalarx/nest/services/logging/ilogging.service'
import { IRedLockService } from '@koalarx/nest/services/redlock/ired-lock.service'
import { Injectable } from '@nestjs/common'
import { DeletePersonHandler } from '../delete/delete-person.handler'
import { ReadManyPersonHandler } from '../read-many/read-many-person.handler'

@Injectable()
export class DeleteInactiveJob extends CronJobHandler {
  constructor(
    redlockService: IRedLockService,
    loggingService: ILoggingService,
    private readonly readManyPerson: ReadManyPersonHandler,
    private readonly deletePerson: DeletePersonHandler,
  ) {
    super(redlockService, loggingService)
  }

  protected async run(): Promise<CronJobResponse> {
    const result = await this.readManyPerson.handle(
      new ReadManyPersonDto({ active: false }),
    )

    if (result.isOk()) {
      for (const person of result.value.items) {
        await this.deletePerson.handle(person.id)

        console.log('Person with id was deleted:', person.id)
      }
    } else {
      console.error('Error to search inactive people:', result.value)
    }

    return ok(null)
  }

  protected async isActive(): Promise<boolean> {
    return true
  }

  protected defineTimeInMinutes(): number {
    return 1
  }
}
