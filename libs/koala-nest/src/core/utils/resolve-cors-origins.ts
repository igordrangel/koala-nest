/**
 * CORS aberto por padrão (`true` = reflete a origin da requisição).
 * Defina `CORS_ORIGINS` apenas quando quiser restringir a origens específicas.
 */
export function resolveCorsOrigin(
  origins: string | undefined,
): boolean | string | string[] {
  const normalized = origins?.trim();

  if (!normalized) {
    return true;
  }

  const list = normalized
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (list.length === 1) {
    return list[0];
  }

  return list;
}
