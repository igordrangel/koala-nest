import { INestApplication, type InjectionToken } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

export function isProviderRegistered(
  app: INestApplication,
  token: InjectionToken,
): boolean {
  const modulesContainer = app.get(ModulesContainer);

  return [...modulesContainer.values()].some(
    (module) => module?.providers?.has(token) ?? false,
  );
}

export function resolveAppProvider<T>(
  app: INestApplication,
  token: InjectionToken,
): T | undefined {
  try {
    const resolved = app.get<T>(token, { strict: false });

    if (resolved) {
      return resolved;
    }
  } catch {
    // provider ausente neste contexto
  }

  const modulesContainer = app.get(ModulesContainer);

  for (const moduleRef of modulesContainer.values()) {
    const provider = moduleRef.providers.get(token);

    if (provider?.instance) {
      return provider.instance as T;
    }
  }

  return undefined;
}
