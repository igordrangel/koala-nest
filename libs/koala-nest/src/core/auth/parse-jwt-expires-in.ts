/** Converte `expiresIn` do @nestjs/jwt (ex.: `15m`, `7d`) para segundos. */
export function parseJwtExpiresInToSeconds(expiresIn: string): number {
  if (/^\d+$/.test(expiresIn)) {
    return parseInt(expiresIn, 10);
  }

  const match = expiresIn.match(/^(\d+)(ms|s|m|h|d)$/);

  if (!match) {
    throw new Error(`JWT expiresIn inválido: ${expiresIn}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 'ms':
      return value / 1000;
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return value;
  }
}
