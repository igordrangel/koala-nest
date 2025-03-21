import { Type } from '@nestjs/common'
import { AutoMappingList } from './auto-mapping-list'

export function createMap(source: Type<any>, target: Type<any>) {
  AutoMappingList.add(source, target)
}
