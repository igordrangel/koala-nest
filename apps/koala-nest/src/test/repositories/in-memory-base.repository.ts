import { QUERY_FILTER_PARAMS } from '@koalarx/nest/core/constants/query-params';
import { PaginationDto } from '@koalarx/nest/core/dtos/pagination.dto';
import { klArray } from '@koalarx/utils/operators/array';
import { randomUUID } from 'node:crypto';
import { CreatedRegistreResponseBase } from '../../core/controllers/created-registre-response.base';
import { ListResponseBase } from '../../core/controllers/list-response.base';
import { EntityBase } from '../../core/database/entity.base';
import { IComparableId } from '../../core/utils/interfaces/icomparable';

export abstract class InMemoryBaseRepository<TClass extends EntityBase<any>> {
  protected items: TClass[] = []

  constructor(
    private readonly typeId: 'number' | 'string' = 'number'
  ) {}

  protected async findById(id: IComparableId): Promise<TClass | null> {
    return this.items.find((item) => item._id === id) ?? null
  }

  protected async findMany<T extends PaginationDto>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ) {
    const page = query.page ?? QUERY_FILTER_PARAMS.page
    const limit = query.limit ?? QUERY_FILTER_PARAMS.limit

    return klArray(predicate ? this.items.filter(predicate) : this.items)
      .orderBy(query.orderBy ?? '', query.direction === 'desc')
      .getValue()
      .slice(page * limit, (page + 1) * limit)
  }

  protected async findManyAndCount<T extends PaginationDto>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ): Promise<ListResponseBase<TClass>> {
    const items = await this.findMany(query, predicate)

    return {
      items,
      count: items.length,
    }
  }

  protected async insert(item: TClass): Promise<CreatedRegistreResponseBase<any>> {
    const id = this.typeId === 'number'
      ? this.getNewId()
      : randomUUID()
    
    item.automap({ ...item, id })

    this.items.push(item)

    return { id: item._id }
  }

  protected async edit(item: TClass, updateWhere?: (item: TClass) => boolean) {
    const predicate = updateWhere ?? ((itemDB) => itemDB.equals(item))
    const itemIndex = this.items.findIndex(predicate)

    if (itemIndex > -1) {
      this.items[itemIndex] = item
    }
  }

  protected async remove(
    predicate: (value: TClass, index: number, obj: TClass[]) => unknown,
  ) {
    const itemIndex = this.items.findIndex(predicate)

    if (itemIndex > -1) {
      this.items.splice(itemIndex, 1)
    }
  }

  private getNewId(): IComparableId {
    return this.typeId === 'number'
      ? (klArray(this.items).orderBy('_id', true).getValue()[0]?._id as number) ?? 0 + 1
      : randomUUID()
  }
}
