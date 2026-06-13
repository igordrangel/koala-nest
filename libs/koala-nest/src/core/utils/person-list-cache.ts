import { ICacheService } from '@/domain/common/icache.service';

export const PERSON_LIST_CACHE_PREFIX = 'person:list';

export function invalidatePersonListCache(cache: ICacheService) {
  return cache.invalidateByPrefix(PERSON_LIST_CACHE_PREFIX);
}
