/// <reference types="bun-types/test-globals" />

import { delay } from '@/core/utils/delay';
import {
  CronJobHandlerBase,
  CronJobSettings,
} from '@/core/background-services/cron-service/cron-job.handler.base';
import { FakeLoggingService } from '@/test/services/fake-logging.service';
import { FakeRedLockService } from '@/test/services/fake-red-lock.service';
import { describe, expect, it, spyOn } from 'bun:test';

class CronJobTest extends CronJobHandlerBase {
  constructor() {
    super(new FakeRedLockService(), new FakeLoggingService());
  }

  protected async settings(): Promise<CronJobSettings> {
    return { isActive: true, timeInMinutes: 0.01 };
  }

  static async isCalled(): Promise<void> {
    return undefined;
  }

  protected run(): Promise<void> {
    return CronJobTest.isCalled();
  }
}

describe('CronJobHandlerBase', () => {
  it('executa o callback do job quando ativo', async () => {
    const callbackSpy = spyOn(CronJobTest, 'isCalled');

    void new CronJobTest().start();

    await delay(100);

    expect(callbackSpy).toHaveBeenCalled();
  });
});
