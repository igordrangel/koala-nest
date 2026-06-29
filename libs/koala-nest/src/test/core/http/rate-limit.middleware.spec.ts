/// <reference types="bun-types/test-globals" />

import { createRateLimitMiddleware } from '@/core/http/rate-limit.middleware';
import { describe, expect, it } from 'bun:test';

function createMockResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };

  return response;
}

describe('createRateLimitMiddleware', () => {
  it('permite requisições quando rate limit está desabilitado', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60_000,
      maxRequests: 0,
    });
    let called = false;
    const next = () => {
      called = true;
    };

    middleware(
      { ip: '127.0.0.1' } as never,
      createMockResponse() as never,
      next,
    );

    expect(called).toBe(true);
  });

  it('bloqueia requisições após atingir maxRequests', () => {
    const middleware = createRateLimitMiddleware({
      windowMs: 60_000,
      maxRequests: 2,
    });
    const req = { ip: '127.0.0.1' } as never;
    const next = () => {};

    middleware(req, createMockResponse() as never, next);
    middleware(req, createMockResponse() as never, next);
    const blockedResponse = createMockResponse();

    middleware(req, blockedResponse as never, next);

    expect(blockedResponse.statusCode).toBe(429);
    expect(blockedResponse.body).toMatchObject({
      statusCode: 429,
    });
  });
});
