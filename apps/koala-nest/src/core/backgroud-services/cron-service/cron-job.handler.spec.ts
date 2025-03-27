import { klDelay } from '@koalarx/utils/operators/delay'
import { vi } from 'vitest'
import { FakeLoggingService } from '../../../test/services/fake-logging.service'
import { FakeRedLockService } from '../../../test/services/fake-red-lock.service'
import { ok } from '../../request-overflow/request-result'
import { CronJobHandlerBase, CronJobResponse } from './cron-job.handler.base'

export class CronJobTest extends CronJobHandlerBase {
  constructor() {
    super(new FakeRedLockService(), new FakeLoggingService())
  }

  static async isCalled(): Promise<CronJobResponse> {
    return ok(null)
  }

  protected run(): Promise<CronJobResponse> {
    return CronJobTest.isCalled()
  }

  protected async isActive(): Promise<boolean> {
    return true
  }

  protected defineTimeInMinutes(): number {
    return 0.01
  }
}

test('cron job', async () => {
  const callbackSpy = vi.spyOn(CronJobTest, 'isCalled')

  new CronJobTest().start()

  await klDelay(100)

  expect(callbackSpy).toHaveBeenCalled()
})
