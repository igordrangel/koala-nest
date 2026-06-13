import { describe, expect, it } from "bun:test";
import {
  isMissingIoredisModule,
  RedisIndicator,
} from "@/infra/services/redis.indicator.service";

describe("RedisIndicator", () => {
  it("retorna up quando REDIS_CONNECTION_STRING não está definido", async () => {
    const indicator = new RedisIndicator({
      get: () => undefined,
    } as never);

    await expect(indicator.isHealthy()).resolves.toEqual({
      redis: { status: "up" },
    });
  });

  it("isConfigured reflete presença de REDIS_CONNECTION_STRING", () => {
    const configured = new RedisIndicator({
      get: (key: string) =>
        key === "REDIS_CONNECTION_STRING" ? "redis://localhost:6379" : undefined,
    } as never);

    const notConfigured = new RedisIndicator({
      get: () => undefined,
    } as never);

    expect(configured.isConfigured()).toBe(true);
    expect(notConfigured.isConfigured()).toBe(false);
  });
});

describe("isMissingIoredisModule", () => {
  it("detecta módulo ioredis ausente", () => {
    const error = new Error("Cannot find module 'ioredis'");
    (error as NodeJS.ErrnoException).code = "ERR_MODULE_NOT_FOUND";

    expect(isMissingIoredisModule(error)).toBe(true);
  });

  it("ignora outros erros", () => {
    expect(isMissingIoredisModule(new Error("ECONNREFUSED"))).toBe(false);
    expect(isMissingIoredisModule("fail")).toBe(false);
  });
});
