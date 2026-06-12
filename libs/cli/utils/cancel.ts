import { cancel, isCancel } from '@clack/prompts';

export function assertNotCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Operação cancelada.');
    process.exit(0);
  }

  return value as T;
}
