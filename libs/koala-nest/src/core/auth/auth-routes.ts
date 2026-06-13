export const AUTH_REFRESH_ROUTE_SUFFIX = '/auth/refresh';

export function isAuthRefreshRoute(url?: string): boolean {
  return url?.includes(AUTH_REFRESH_ROUTE_SUFFIX) ?? false;
}
