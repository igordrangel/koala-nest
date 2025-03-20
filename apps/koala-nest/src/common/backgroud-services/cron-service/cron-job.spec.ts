import { klDelay } from '@koalarx/utils/operators/delay'
import { vi } from 'vitest'
import { FakeLoggingService } from '../../../test/services/fake-logging.service'
import { FakeRedLockService } from '../../../test/services/fake-red-lock.service'
import { ok } from '../../mediator/request-result'
import { CronJob, CronJobResponse } from './cron-job'

export class CronJobTest extends CronJob {
  constructor() {
    super(
      new FakeRedLockService(),
      new FakeLoggingService(),
      'username',
      'koala-nest',
      0.01,
    )
  }

  static async isCalled(): Promise<CronJobResponse> {
    return ok(null)
  }

  async run(): Promise<void> {
    await this.start(CronJobTest.isCalled)
  }

  protected async isActive(): Promise<boolean> {
    return true
  }
}

test('cron job', async () => {
  const callbackSpy = vi.spyOn(CronJobTest, 'isCalled')

  new CronJobTest().run()

  await klDelay(100)

  expect(callbackSpy).toHaveBeenCalled()
})
