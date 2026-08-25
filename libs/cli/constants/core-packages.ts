import type { PackageManager } from '@cli/types';
import { AppType } from '@cli/constants/domain';

/** Dependências HTTP/OpenAPI — só no perfil API. */
export const CORE_HTTP_PACKAGES = [
  '@nestjs/swagger',
  '@scalar/nestjs-api-reference',
  'cookie-parser',
  'helmet',
] as const;

export const CORE_HTTP_DEV_PACKAGES = ['@types/cookie-parser'] as const;

/** Dependências sempre instaladas com o módulo core (API e Worker). */
export const CORE_BASE_PACKAGES = [
  '@koalarx/utils@^5.0.0',
  '@nestjs/config',
  'typeorm',
  'pg',
  'zod',
  'dotenv',
] as const;

/** @deprecated Prefer getCorePackages(AppType) — inclui HTTP por compatibilidade. */
export const CORE_PACKAGES = [
  ...CORE_BASE_PACKAGES,
  ...CORE_HTTP_PACKAGES,
] as const;

export const CORE_DEV_PACKAGES = [
  ...CORE_HTTP_DEV_PACKAGES,
  'ts-node',
  'tsconfig-paths',
  'tsc-alias',
] as const;

export const CORE_WORKER_DEV_PACKAGES = [
  'ts-node',
  'tsconfig-paths',
  'tsc-alias',
] as const;

export function getCorePackages(appType: AppType = AppType.API): readonly string[] {
  if (appType === AppType.WORKER) {
    return CORE_BASE_PACKAGES;
  }

  return CORE_PACKAGES;
}

export function getCoreDevPackages(
  appType: AppType = AppType.API,
): readonly string[] {
  if (appType === AppType.WORKER) {
    return CORE_WORKER_DEV_PACKAGES;
  }

  return CORE_DEV_PACKAGES;
}

/** Redis — instalado ao selecionar Cache (Redis). */
export const CACHE_PACKAGES = ['ioredis'] as const;

/** Autenticação JWT/OAuth2/API Key. */
export const AUTH_PACKAGES = [
  '@nestjs/jwt',
  '@nestjs/passport',
  'passport',
  'passport-jwt',
  'passport-custom',
  'bcrypt',
] as const;

export const AUTH_DEV_PACKAGES = ['@types/bcrypt'] as const;

/** Jobs internos com expressão cron. */
export const CRON_PACKAGES = ['cron-parser'] as const;

/** Health check com @nestjs/terminus (padrão Globo Seguros). */
export const HEALTH_PACKAGES = ['@nestjs/terminus', '@nestjs/axios'] as const;

export function devAddFlag(packageManager: PackageManager) {
  switch (packageManager) {
    case 'npm':
      return '-D';
    case 'pnpm':
      return '-D';
    default:
      return '-d';
  }
}
