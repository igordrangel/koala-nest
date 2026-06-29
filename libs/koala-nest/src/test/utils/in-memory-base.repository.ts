import { PaginationDto } from '@/domain/dtos/pagination.dto';
import { ListResponseBase } from '@/core/common/list-response.base';
import { QUERY_FILTER_PARAMS } from '@/core/constants/query-params';
import { KlArray } from '@koalarx/utils/KlArray';
import { randomUUID } from 'node:crypto';

export abstract class InMemoryBaseRepository<
  TClass extends { id?: number | string | null },
> {
  protected items: TClass[] = [];

  constructor(private readonly typeId: 'number' | 'string' = 'number') {}

  protected async findById(id: number | string) {
    return this.items.find((item) => item.id === id) ?? null;
  }

  protected async findMany<T extends PaginationDto>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ) {
    const page = query.page ?? QUERY_FILTER_PARAMS.page;
    const limit = query.limit ?? QUERY_FILTER_PARAMS.limit;

    return new KlArray(predicate ? this.items.filter(predicate) : this.items)
      .orderBy(query.orderBy ?? '', query.direction)
      .slice(page * limit, (page + 1) * limit);
  }

  protected async findManyAndCount<T extends PaginationDto>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ): Promise<ListResponseBase<TClass>> {
    const filtered = predicate ? this.items.filter(predicate) : this.items;
    const page = query.page ?? QUERY_FILTER_PARAMS.page;
    const limit = query.limit ?? QUERY_FILTER_PARAMS.limit;
    const items = new KlArray(filtered)
      .orderBy(query.orderBy ?? '', query.direction)
      .slice(page * limit, (page + 1) * limit);

    return ListResponseBase.from({ items, count: filtered.length });
  }

  protected async saveChanges(
    item: TClass,
    updateWhere?: (item: TClass) => boolean,
  ) {
    if (!item.id) {
      const id = this.typeId === 'number' ? this.getNewId() : randomUUID();
      (item as { id: number | string }).id = id;
      this.items.push(item);
      return { id };
    }

    const predicate = updateWhere ?? ((stored) => stored.id === item.id);
    const itemIndex = this.items.findIndex(predicate);

    if (itemIndex > -1) {
      this.items[itemIndex] = item;
    } else {
      this.items.push(item);
    }
  }

  protected async remove(
    predicate: (value: TClass, index: number, obj: TClass[]) => unknown,
  ) {
    const itemIndex = this.items.findIndex(predicate);
    if (itemIndex > -1) this.items.splice(itemIndex, 1);
  }

  private getNewId() {
    if (this.typeId === 'number') {
      const lastId = new KlArray(this.items).orderBy('id', 'desc')[0]?.id;
      return lastId ? (lastId as number) + 1 : 1;
    }

    return randomUUID();
  }
}
