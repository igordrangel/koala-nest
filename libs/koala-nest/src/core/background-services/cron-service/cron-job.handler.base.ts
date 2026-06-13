import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { KoalaGlobalVars } from '@/core/koala-global-vars';
import { delay } from '@/core/utils/delay';

export interface CronJobSettings {
  isActive: boolean;
  timeInMinutes: number;
}

export abstract class CronJobHandlerBase {
  constructor(
    private readonly redlockService: IRedLockService,
    private readonly loggingService: ILoggingService,
  ) {}

  protected abstract run(): Promise<void>;

  protected abstract settings(): Promise<CronJobSettings>;

  async start(): Promise<void> {
    const name = this.constructor.name;

    while (true) {
      const settings = await this.settings();
      const timeout = settings.timeInMinutes * 60 * 1000;

      if (settings.isActive) {
        const ttlSecondsLock = timeout / 1000;
        const acquiredLock = await this.redlockService.acquiredLock(
          name,
          ttlSecondsLock,
        );

        if (acquiredLock) {
          try {
            await this.run();
          } catch (error) {
            const reportError =
              error instanceof Error ? error : new Error(String(error));

            try {
              await this.loggingService.report({
                error: reportError,
                packageName: KoalaGlobalVars.appName,
                loggedUsername: KoalaGlobalVars.internalUserName,
              });
            } catch {
              console.error(reportError);
            }
          }
        }
      }

      await delay(timeout);

      await this.redlockService.releaseLock(name);
    }
  }
}
