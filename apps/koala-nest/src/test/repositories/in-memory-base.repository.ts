import { QUERY_FILTER_PARAMS } from '@koalarx/nest/core/constants/query-params'
import { PaginationDto } from '@koalarx/nest/core/dtos/pagination.dto'
import { KlArray } from '@koalarx/utils/KlArray'
import { randomUUID } from 'node:crypto'
import { ListResponseBase } from '../../core/controllers/list-response.base'
import { EntityActionType, EntityBase } from '../../core/database/entity.base'
import { IComparableId } from '../../core/utils/interfaces/icomparable'

export abstract class InMemoryBaseRepository<TClass extends EntityBase<any>> {
  protected items: TClass[] = []

  constructor(private readonly typeId: 'number' | 'string' = 'number') {}

  protected async findById(id: IComparableId): Promise<TClass | null> {
    const entity = this.items.find((item) => item._id === id) ?? null

    if (entity) {
      entity._action = EntityActionType.update
    }

    return entity
  }

  protected async findMany<T extends PaginationDto>(
    query: T,
    predicate?: (value: TClass, index: number, array: TClass[]) => unknown,
  ) {
    const page = query.page ?? QUERY_FILTER_PARAMS.page
    const limit = query.limit ?? QUERY_FILTER_PARAMS.limit

    return new KlArray(predicate ? this.items.filter(predicate) : this.items)
      .orderBy(query.orderBy ?? '', query.direction)
      .slice(page * limit, (page + 1) * limit)
      .map((item) => {
        item._action = EntityActionType.update
        return item
      })
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

  protected async saveChanges(
    item: TClass,
    updateWhere?: (item: TClass) => boolean,
  ) {
    if (item._action === EntityActionType.create) {
      const id = this.typeId === 'number' ? this.getNewId() : randomUUID()

      item.automap({ ...item, id })

      this.items.push(item)

      return { id: item._id }
    }

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
    if (this.typeId === 'number') {
      const lastId = new KlArray(this.items).orderBy('_id', 'desc')[0]
        ?._id as number

      return lastId ? lastId + 1 : 1
    }

    return randomUUID()
  }
}
