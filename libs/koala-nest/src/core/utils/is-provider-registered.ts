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
