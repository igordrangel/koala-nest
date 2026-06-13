export abstract class ICacheService {
  abstract get(key: string): Promise<string | null>;
  abstract set(key: string, value: string, ttl?: number): Promise<void>;
  abstract setIfNotExists(
    key: string,
    value: string,
    ttl: number,
  ): Promise<boolean>;
  abstract invalidate(key: string): Promise<void>;
  abstract invalidateByPrefix(prefix: string): Promise<void>;
}
