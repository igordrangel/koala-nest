import { delay } from '@koalarx/utils/KlDelay'
import { ILoggingService } from '../../../services/logging/ilogging.service'
import { IRedLockService } from '../../../services/redlock/ired-lock.service'
import { KoalaGlobalVars } from '../../koala-global-vars'
import { RequestResult } from '../../request-overflow/request-result'

export type CronJobResponse = RequestResult<Error, null>
export interface CronJobSettings {
  isActive: boolean
  timeInMinutes: number
}

export abstract class CronJobHandlerBase {
  constructor(
    private readonly redlockService: IRedLockService,
    private readonly loggingService: ILoggingService,
  ) {}

  protected abstract run(): Promise<CronJobResponse>

  protected abstract settings(): Promise<CronJobSettings>

  async start(): Promise<void> {
    const name = this.constructor.name

    while (true) {
      const settings = await this.settings()
      const timeout = settings.timeInMinutes * 60 * 1000

      if (settings.isActive) {
        const ttlSecondsLock = timeout / 1000
        const acquiredLock = await this.redlockService.acquiredLock(
          name,
          ttlSecondsLock,
        )

        if (acquiredLock) {
          const error = await this.run()
            .then((result) => {
              if (result.isFailure()) {
                return result.value
              }
              return null
            })
            .catch((error) => error)

          if (error) {
            try {
              await this.loggingService.report({
                error,
                packageName: KoalaGlobalVars.appName,
                loggedUsername: KoalaGlobalVars.internalUserName,
              })
            } catch {
              console.error(error)
            }
          }
        }
      }

      await delay(timeout)

      await this.redlockService.releaseLock(name)
    }
  }
}
