import { ObjectClass } from '@/core/base/object-class';
import { AutoMap } from '@/core/tools/mapping';

export class ListResponseBase<T> extends ObjectClass<ListResponseBase<T>> {
  @AutoMap()
  items!: T[];

  @AutoMap()
  count!: number;
}
