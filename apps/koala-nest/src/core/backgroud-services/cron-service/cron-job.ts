import { klDelay } from '@koalarx/utils/operators/delay'
import { ILoggingService } from '../../../services/logging/ilogging.service'
import { IRedLockService } from '../../../services/redlock/ired-lock.service'
import { RequestResult } from '../../request-overflow/request-result'

export type CronJobResponse = RequestResult<Error, null>

export abstract class CronJob {
  public readonly timeout: number

  protected constructor(
    private readonly redlockService: IRedLockService,
    private readonly loggingService: ILoggingService,
    private readonly loggedUsername: string,
    private readonly appName: string,
    timeInMinutes: number,
  ) {
    this.timeout = timeInMinutes * 60 * 1000
  }

  abstract run(): Promise<void>

  protected abstract isActive(): Promise<boolean>

  protected async start(job: () => Promise<CronJobResponse>): Promise<void> {
    const name = this.constructor.name

    while (true) {
      if (await this.isActive()) {
        const ttlSecondsLock = this.timeout / 1000
        const acquiredLock = await this.redlockService.acquiredLock(
          name,
          ttlSecondsLock,
        )

        if (acquiredLock) {
          const error = await job()
            .then((result) => {
              if (result.isFailure()) {
                return result.value
              }
              return null
            })
            .catch((error) => error)

          if (error) {
            this.loggingService.report({
              error,
              packageName: this.appName,
              loggedUsername: this.loggedUsername,
            })
          }
        }
      }

      await klDelay(this.timeout)

      await this.redlockService.releaseLock(name)
    }
  }
}
