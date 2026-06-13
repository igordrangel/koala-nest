import { IRedLockService } from '@/domain/common/ired-lock.service';

export class FakeRedLockService implements IRedLockService {
  acquiredLock(_key: string, _ttlSecondsLock: number): Promise<boolean> {
    return Promise.resolve(true);
  }

  releaseLock(_key: string): Promise<void> {
    return Promise.resolve();
  }
}
