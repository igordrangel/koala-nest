export function buildListCacheKey(prefix: string, query: object) {
  const normalized = Object.keys(query)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = (query as Record<string, unknown>)[key];

      if (typeof value === 'function') {
        return acc;
      }

      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }

      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(normalized)}`;
}
