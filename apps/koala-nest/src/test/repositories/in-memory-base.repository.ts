import { klArray } from '@koalarx/utils/operators/array';
import { CreatedRegistreResponseBase } from '../../core/controllers/created-registre-response.base';
import { ListResponseBase } from '../../core/controllers/list-response.base';
import { EntityBase } from '../../core/database/entity.base';
import { PaginationParams, QueryFilterParams } from '../../core/models/pagination-params';
import { IComparableId } from '../../core/utils/interfaces/icomparable';

export abstract class InMemoryBaseRepository<TClass extends EntityBase<any>> {
  protected items: TClass[] = []

  protected async findByIdInternal(id: IComparableId): Promise<TClass | null> {
    return this.items.find((item) => item._id === id) ?? null
  }

  protected async findManyInternal<T extends PaginationParams>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ): Promise<ListResponseBase<TClass>> {
    const page = query.page ?? QueryFilterParams.page
    const limit = query.limit ?? QueryFilterParams.limit

    const items = klArray(predicate ? this.items.filter(predicate) : this.items)
      .orderBy(query.orderBy ?? '', query.direction === 'desc')
      .getValue()
      .slice(page * limit, (page + 1) * limit)

    return {
      items,
      count: items.length,
    }
  }

  protected async saveInternal(item: TClass): Promise<void> {
    const itemIndex = this.items.findIndex((itemDB) => itemDB.equals(item))

    if (itemIndex > -1) {
      this.items[itemIndex] = item
    }
  }

  protected async createInternal(
    item: TClass,
  ): Promise<CreatedRegistreResponseBase> {
    this.items.push(item)

    return { id: item._id }
  }

  protected async deleteInternal(
    predicate: (value: TClass, index: number, obj: TClass[]) => unknown,
  ) {
    const itemIndex = this.items.findIndex(predicate)

    if (itemIndex > -1) {
      this.items.splice(itemIndex, 1)
    }
  }
}
