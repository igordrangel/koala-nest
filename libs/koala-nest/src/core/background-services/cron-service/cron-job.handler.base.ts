import { ILoggingService } from '@/domain/common/ilogging.service';
import { IRedLockService } from '@/domain/common/ired-lock.service';
import {
  cronExpressionToBoolean,
  getCronExecutionKey,
} from '@/core/utils/cron-expression-to-boolean';
import { DEFAULT_CRON_POLL_MINUTES } from '@/core/constants/cron.constants';
import { MINUTES_TO_MS, MS_TO_SECONDS } from '@/core/utils/time.constants';
import { delay } from '@koalarx/utils/KlDelay';
import { reportErrorToLogging } from '@/core/utils/report-error';

export interface CronJobSettings {
  isActive: boolean;
  timeInMinutes: number;
  cronExpression?: string;
}

export function cronJobSettings(
  cronExpression: string,
  timeInMinutes = DEFAULT_CRON_POLL_MINUTES,
): CronJobSettings {
  return {
    isActive: cronExpressionToBoolean(cronExpression),
    timeInMinutes,
    cronExpression,
  };
}

export abstract class CronJobHandlerBase {
  private lastExecutedCronKey: string | null = null;

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
      const timeout = settings.timeInMinutes * MINUTES_TO_MS;

      if (settings.isActive) {
        const executionKey = settings.cronExpression
          ? getCronExecutionKey(settings.cronExpression)
          : null;

        const alreadyExecutedThisTick =
          executionKey !== null &&
          executionKey === this.lastExecutedCronKey;

        if (!alreadyExecutedThisTick) {
          const ttlSecondsLock = timeout / MS_TO_SECONDS;
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
              if (executionKey !== null) {
                this.lastExecutedCronKey = executionKey;
              }

              await this.redlockService.releaseLock(name);
            }
          }
        }
      }

      await delay(timeout);
    }
  }
}
