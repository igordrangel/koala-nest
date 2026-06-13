/** Expressões cron usadas nos jobs de demonstração (segundo = 6 campos). */
export const DemoCronExpression = {
  /** A cada hora. */
  HOURLY: '0 */1 * * * *',
  /** A cada 5 minutos. */
  EVERY_FIVE_MINUTES: '0 */5 * * * *',
} as const;

/** Intervalo de poll dos cron jobs de demo (minutos). */
export const DEMO_CRON_POLL_MINUTES = 0.01;

/** Conversão de minutos para milissegundos. */
export const MINUTES_TO_MS = 60 * 1000;

/** Conversão de milissegundos para segundos. */
export const MS_TO_SECONDS = 1000;
