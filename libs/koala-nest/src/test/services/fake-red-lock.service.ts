import { IRedLockService } from '@/domain/common/ired-lock.service';

export class FakeRedLockService implements IRedLockService {
  async acquiredLock(_key: string, _ttlSecondsLock: number): Promise<boolean> {
    return true;
  }

  async releaseLock(_key: string): Promise<void> {
    //
  }
}
