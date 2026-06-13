/** Expressões cron prontas (segundo = 6 campos). */
export const CronExpression = {
  /** A cada 15 segundos — intervalo didático para o template de exemplo. */
  EVERY_15_SECONDS: '*/15 * * * * *',
  /** A cada minuto. */
  EVERY_MINUTE: '0 */1 * * * *',
  /** A cada 5 minutos. */
  EVERY_FIVE_MINUTES: '0 */5 * * * *',
  /** A cada hora (minuto 0). */
  HOURLY: '0 0 * * * *',
} as const;

/** Intervalo padrão de poll dos cron jobs (minutos). */
export const DEFAULT_CRON_POLL_MINUTES = 0.01;
