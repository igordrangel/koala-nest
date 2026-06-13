import type { ICacheService } from '@/domain/common/icache.service';

export class CacheStub implements ICacheService {
  readonly store = new Map<string, string>();
  readonly invalidateByPrefixCalls: string[] = [];

  get(key: string) {
    return Promise.resolve(this.store.get(key) ?? null);
  }

  set(key: string, value: string, _ttl?: number) {
    this.store.set(key, value);
    return Promise.resolve();
  }

  setIfNotExists(key: string, value: string, _ttl: number) {
    if (this.store.has(key)) {
      return Promise.resolve(false);
    }

    this.store.set(key, value);
    return Promise.resolve(true);
  }

  invalidate(key: string) {
    this.store.delete(key);
    return Promise.resolve();
  }

  invalidateByPrefix(prefix: string) {
    this.invalidateByPrefixCalls.push(prefix);

    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }

    return Promise.resolve();
  }
}
