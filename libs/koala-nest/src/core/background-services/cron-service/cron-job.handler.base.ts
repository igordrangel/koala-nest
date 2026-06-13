import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import { cronExpressionToBoolean } from '@/core/utils/cron-expression-to-boolean';
import { delay } from '@/core/utils/delay';
import { reportErrorToLogging } from '@/core/utils/report-error';

export interface CronJobSettings {
  isActive: boolean;
  timeInMinutes: number;
}

export function demoCronSettings(
  cronExpression: string,
  timeInMinutes = 0.01,
): CronJobSettings {
  return {
    isActive: cronExpressionToBoolean(cronExpression),
    timeInMinutes,
  };
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

            await reportErrorToLogging(this.loggingService, reportError);
          } finally {
            await this.redlockService.releaseLock(name);
          }
        }
      }

      await delay(timeout);
    }
  }
}
