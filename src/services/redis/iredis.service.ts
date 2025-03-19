export abstract class IRedisService {
  abstract getCache(key: string): Promise<string | null>
  abstract setCache(
    key: string,
    ttlSecondsCache: number,
    payload: any,
  ): Promise<void>

  abstract deleteCache(key: string): Promise<void>
}
