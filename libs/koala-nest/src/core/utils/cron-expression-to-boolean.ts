import { CronExpressionParser } from 'cron-parser';

/**
 * Verifica se a expressão cron corresponde ao momento atual.
 *
 * @param cronExpression Expressão cron a ser validada
 * @returns booleano indicando se o cronjob deve ser executado agora
 *
 * ---
 *
 * Guia de formação da cronExpression:
 *
 * Uma expressão cron padrão possui 6 campos separados por espaço:
 *
 *   segundo   minuto   hora   dia-mês   mês   dia-semana
 *   -------   ------   ----   -------   ---   ----------
 *      0        0      12       1       *        *
 *
 * Exemplo:
 *   '0 0 12 * * *' → executa todo dia ao meio-dia
 *
 * Campos:
 *   - segundo:        (0-59)
 *   - minuto:         (0-59)
 *   - hora:           (0-23)
 *   - dia do mês:     (1-31)
 *   - mês:            (1-12 ou JAN-DEC)
 *   - dia da semana:  (0-7 ou SUN-SAT, 0/7=domingo)
 *
 * Caracteres especiais:
 *   - *   qualquer valor
 *   - ,   lista de valores
 *   - -   intervalo
 *   - /   passo
 *   - L   último dia
 *   - #   enésimo dia da semana do mês
 *
 * Exemplos:
 *   - '0 0 * * * *'        → todo início de hora
 *   - '0 0/5 * * * *'      → a cada 5 minutos
 *   - '0 0 8 * * 1-5'      → 8h de segunda a sexta
 *   - '0 0 0 1 1 *'        → todo 1º de janeiro à meia-noite
 */
export function cronExpressionToBoolean(
  cronExpression: string,
  now: Date = new Date(),
): boolean {
  try {
    const interval = CronExpressionParser.parse(cronExpression, {
      currentDate: now,
    });
    const prev = interval.prev();

    return (
      prev.getFullYear() === now.getFullYear() &&
      prev.getMonth() === now.getMonth() &&
      prev.getDate() === now.getDate() &&
      prev.getHours() === now.getHours() &&
      prev.getMinutes() === now.getMinutes() &&
      prev.getSeconds() === now.getSeconds()
    );
  } catch {
    return false;
  }
}
