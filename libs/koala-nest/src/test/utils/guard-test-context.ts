import { ExecutionContext } from '@nestjs/common';

export function createGuardContext<TUser extends object>(options: {
  user?: TUser;
  metadata?: Record<string, unknown>;
  metadataKey?: string;
}) {
  const handler = () => undefined;

  if (options.metadataKey && options.metadata) {
    Reflect.defineMetadata(
      options.metadataKey,
      options.metadata[options.metadataKey],
      handler,
    );
  }

  return {
    handler,
    context: {
      getHandler: () => handler,
      getClass: () => class {},
      switchToHttp: () => ({
        getRequest: () => ({ user: options.user }),
      }),
    } as unknown as ExecutionContext,
  };
}
