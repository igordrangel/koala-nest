import { Type } from '@nestjs/common';
import { ForMemberDefinition } from './for-member';
import { MappingStore } from './mapping-store';

export function createMap<TSource, TTarget>(
  source: Type<TSource>,
  target: Type<TTarget>,
  ...formMember: ForMemberDefinition<TTarget, TSource>
) {
  MappingStore.add(source, target, ...formMember);
}
