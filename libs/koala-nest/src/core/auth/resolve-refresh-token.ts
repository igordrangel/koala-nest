import { AuthHttp } from '@/core/auth/auth.constants';
import { isAuthRefreshRoute } from '@/core/auth/auth-routes';

type RefreshTokenRequest = {
  cookies?: Record<string, string>;
  body?: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
};

export function resolveRefreshTokenFromRequest(
  request: RefreshTokenRequest,
): string | undefined {
  const authorization = request.headers.authorization;

  if (typeof authorization === 'string') {
    if (authorization.startsWith(AuthHttp.BEARER_PREFIX)) {
      return authorization.slice(AuthHttp.BEARER_PREFIX.length).trim();
    }
  }

  return (
    request.cookies?.[AuthHttp.REFRESH_TOKEN_COOKIE] ??
    request.body?.refresh_token ??
    request.body?.refreshToken
  );
}

export function applyRefreshTokenForRefreshRoute(
  request: RefreshTokenRequest & { url?: string },
): void {
  if (!isAuthRefreshRoute(request.url)) {
    return;
  }

  const refreshToken = resolveRefreshTokenFromRequest(request);

  if (refreshToken) {
    request.headers.authorization = `${AuthHttp.BEARER_PREFIX}${refreshToken}`;
  }
}
