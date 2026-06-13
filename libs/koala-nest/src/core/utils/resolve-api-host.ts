export function resolveApiHost(
  host: string | undefined,
  port: number,
): string {
  const rawHost = host ?? `http://localhost:${port}`;
  const normalized = rawHost.replace(/\/$/, '');
  const hasProtocol =
    normalized.startsWith('http://') || normalized.startsWith('https://');

  return hasProtocol ? normalized : `http://${normalized}`;
}
