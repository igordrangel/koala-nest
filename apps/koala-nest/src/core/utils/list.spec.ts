import { EntityBase } from '../database/entity.base'
import { List } from './list'

class EntityTest extends EntityBase<EntityTest> {
  id: number
  value: number
}

describe('List test', () => {
  let entity: EntityTest

  beforeEach(() => {
    entity = new EntityTest()
    
    // TODO: Tentar passar direto no construtor
    entity.automap({id: 1, value: 1})
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
})
