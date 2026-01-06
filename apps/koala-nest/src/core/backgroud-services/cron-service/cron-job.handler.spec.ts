import { delay } from '@koalarx/utils/KlDelay'
import { expect, spyOn, test } from 'bun:test'
import { FakeLoggingService } from '../../../test/services/fake-logging.service'
import { FakeRedLockService } from '../../../test/services/fake-red-lock.service'
import { ok } from '../../request-overflow/request-result'
import {
  CronJobHandlerBase,
  CronJobResponse,
  CronJobSettings,
} from './cron-job.handler.base'

export class CronJobTest extends CronJobHandlerBase {
  constructor() {
    super(new FakeRedLockService(), new FakeLoggingService())
  }

  protected async settings(): Promise<CronJobSettings> {
    return { isActive: true, timeInMinutes: 0.01 }
  }

  static async isCalled(): Promise<CronJobResponse> {
    return ok(null)
  }

  protected run(): Promise<CronJobResponse> {
    return CronJobTest.isCalled()
  }
}

test('cron job', async () => {
  const callbackSpy = spyOn(CronJobTest, 'isCalled')

  new CronJobTest().start()

  await delay(100)

  expect(callbackSpy).toHaveBeenCalled()
})
