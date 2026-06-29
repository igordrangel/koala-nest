import type { Type } from '@nestjs/common';
import { MappingStore } from '@/core/tools/mapping/mapping-store';

export function initializeUndefinedArrayProps(
  target: Record<string, unknown>,
  entity: Type<unknown>,
  onlyProps?: string[],
): void {
  MappingStore.getAllProps(entity).forEach((prop) => {
    if (onlyProps && !onlyProps.includes(prop.name)) {
      return;
    }

    if (target[prop.name] !== undefined || !prop.isArray) {
      return;
    }

    target[prop.name] = [];
  });
}
