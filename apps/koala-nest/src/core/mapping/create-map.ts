import { Type } from '@nestjs/common'
import { AutoMappingList } from './auto-mapping-list'
import { ForMemberDefinition } from './for-member'

export function createMap<TSource, TTarget>(
  source: Type<TSource>,
  target: Type<TTarget>,
  ...formMember: ForMemberDefinition<TTarget, TSource>
) {
  AutoMappingList.add(source, target, ...formMember)
}
