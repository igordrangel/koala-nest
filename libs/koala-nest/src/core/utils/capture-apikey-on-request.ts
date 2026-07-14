import { AuthHttp } from '@/core/auth/auth.constants';
import { Request } from 'express';

/** Lê o header `ApiKey` (case-insensitive via Express). */
export function captureApiKeyOnRequest(request: Request): string | undefined {
  const value = request.headers[AuthHttp.API_KEY_HEADER.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === 'string' ? value : undefined;
}
