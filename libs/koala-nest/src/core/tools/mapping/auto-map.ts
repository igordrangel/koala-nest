import { Type } from '@nestjs/common';
import { MappingStore } from './mapping-store';

interface AutoMapConfig<T> {
  type?: () => Type<T>;
  isArray?: boolean;
}

export function AutoMap<T>(config?: AutoMapConfig<T>) {
  return function (target: object, propertyKey: string) {
    const designType = Reflect.getMetadata('design:type', target, propertyKey);
    const isArray = config?.isArray ?? designType === Array;

    if (config?.type) {
      if (isArray) {
        Reflect.defineMetadata(
          'composition:type',
          config.type,
          target,
          propertyKey,
        );
      } else if (!designType) {
        Reflect.defineMetadata(
          'design:type',
          config.type(),
          target,
          propertyKey,
        );
      }
    }

    MappingStore.setProp(
      (target as { constructor: Type<unknown> }).constructor,
      propertyKey,
      config?.type,
    );
  };
}
