/** Prefixos e chaves do cache distribuído / em memória. */
export const CacheKeyPrefix = {
  OAUTH2_STATE: 'oauth2:state:',
  RED_LOCK: 'redLock:',
} as const;

/** TTLs em segundos para entradas de cache. */
export const CacheTtlSeconds = {
  /** Estado OAuth2 durante o fluxo de autorização (10 minutos). */
  OAUTH2_STATE: 10 * 60,
  /** Listagem paginada de Person (2 minutos). */
  PERSON_LIST: 120,
} as const;

/** TTL padrão do RedLock quando não derivado do cron (segundos). */
export const DEFAULT_RED_LOCK_TTL_SECONDS = 30;
