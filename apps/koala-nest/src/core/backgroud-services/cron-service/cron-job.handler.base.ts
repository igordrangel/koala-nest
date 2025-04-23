import { delay } from '@koalarx/utils/KlDelay'
import { ILoggingService } from '../../../services/logging/ilogging.service'
import { IRedLockService } from '../../../services/redlock/ired-lock.service'
import { KoalaGlobalVars } from '../../koala-global-vars'
import { RequestResult } from '../../request-overflow/request-result'

export type CronJobResponse = RequestResult<Error, null>

export abstract class CronJobHandlerBase {
  private readonly _timeout: number

  constructor(
    private readonly redlockService: IRedLockService,
    private readonly loggingService: ILoggingService,
  ) {
    this._timeout = this.defineTimeInMinutes() * 60 * 1000
  }

  protected abstract run(): Promise<CronJobResponse>

  protected abstract isActive(): Promise<boolean>

  protected abstract defineTimeInMinutes(): number

  async start(): Promise<void> {
    const name = this.constructor.name

    while (true) {
      if (await this.isActive()) {
        const ttlSecondsLock = this._timeout / 1000
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

      await delay(this._timeout)

      await this.redlockService.releaseLock(name)
    }
  }
}
