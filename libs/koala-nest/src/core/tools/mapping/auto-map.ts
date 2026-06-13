import { Type } from '@nestjs/common';
import { MappingStore } from './mapping-store';

interface AutoMapConfig<T> {
  type?: () => Type<T>;
}

export function AutoMap<T>(config?: AutoMapConfig<T>) {
  return function (target: any, propertyKey: string) {
    const compositionType: (() => any) | undefined = config?.type;

    MappingStore.setProp(target.constructor, propertyKey, compositionType);
  };
}
