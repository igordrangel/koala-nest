import { IRedLockService } from '../../services/redlock/ired-lock.service'

export class FakeRedLockService implements IRedLockService {
  async acquiredLock(key: string, ttlSecondsLock: number): Promise<boolean> {
    return true
  }

  async releaseLock(key: string): Promise<void> {
    //
  }
}
