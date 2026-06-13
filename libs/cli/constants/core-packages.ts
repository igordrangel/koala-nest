import type { PackageManager } from "../types";

/** Dependências sempre instaladas com o módulo core. */
export const CORE_PACKAGES = [
  "@koalarx/utils",
  "@nestjs/config",
  "@nestjs/swagger",
  "typeorm",
  "pg",
  "zod",
  "@scalar/nestjs-api-reference",
] as const;

/** Redis — instalado ao selecionar Cache (Redis). */
export const CACHE_PACKAGES = ["ioredis"] as const;

/** Autenticação JWT/OAuth2. */
export const AUTH_PACKAGES = [
  "@nestjs/jwt",
  "@nestjs/passport",
  "passport",
  "passport-jwt",
  "cookie-parser",
] as const;

export const AUTH_DEV_PACKAGES = ["@types/cookie-parser"] as const;

/** Jobs internos com expressão cron. */
export const CRON_PACKAGES = ["cron-parser"] as const;

/** Health check com @nestjs/terminus (padrão Globo Seguros). */
export const HEALTH_PACKAGES = ["@nestjs/terminus", "@nestjs/axios"] as const;

export function devAddFlag(packageManager: PackageManager) {
  switch (packageManager) {
    case "npm":
      return "-D";
    case "pnpm":
      return "-D";
    default:
      return "-d";
  }
}
