export abstract class IRedLockService {
  abstract acquiredLock(key: string, ttlSecondsLock: number): Promise<boolean>
  abstract releaseLock(key: string): Promise<void>
}
