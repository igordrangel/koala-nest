import { EntityBase } from '../database/entity.base'
import { Entity } from '../database/entity.decorator'
import { AutoMap } from '../mapping/auto-mapping.decorator'
import { List } from './list'

@Entity()
class EntityTest extends EntityBase<EntityTest> {
  @AutoMap()
  id: number

  @AutoMap()
  value: number
}

describe('List test', () => {
  let entity: EntityTest

  beforeEach(() => {
    entity = new EntityTest({ id: 1, value: 1 })
  })

  it('should add item on list', () => {
    const list = new List<number>()
    list.add(1)

    expect(list.toArray('added').length).toBe(1)
    expect(list.toArray('added')[0]).toEqual(1)
  })

  it('should update item on list', () => {
    const list = new List(EntityTest).setList([entity])

    entity.value = 2

    list.add(entity)

    expect(list.toArray('updated').length).toBe(1)
    expect(list.toArray('updated')[0].value).toEqual(2)
  })

  it('should remove item on list', () => {
    const list = new List(EntityTest).setList([entity])

    list.remove(entity)

    expect(list.toArray().length).toBe(0)
    expect(list.toArray('removed').length).toBe(1)
    expect(list.toArray('removed')[0].value).toEqual(1)
  })

  it('should get item by id', () => {
    const list = new List(EntityTest).setList([entity])

    expect(list.findById(entity.id)).toEqual(entity)
  })

  it('should order items', () => {
    const list = new List(EntityTest).setList([
      new EntityTest({ id: 1, value: 3 }),
      new EntityTest({ id: 2, value: 1 }),
      new EntityTest({ id: 3, value: 2 }),
    ])

    list.orderBy('value', 'asc')

    const orderedValues = list.toArray().map((item) => item.value)

    expect(orderedValues).toEqual([1, 2, 3])
  })

  it('should get first and last items', () => {
    const list = new List(EntityTest).setList([
      new EntityTest({ id: 1, value: 1 }),
      new EntityTest({ id: 2, value: 2 }),
      new EntityTest({ id: 3, value: 3 }),
    ])

    expect(list.first()!.value).toBe(1)
    expect(list.last()!.value).toBe(3)
  })
})
