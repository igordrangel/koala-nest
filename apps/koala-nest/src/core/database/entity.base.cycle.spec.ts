import { AutoMap } from '../mapping/auto-mapping.decorator'
import { EntityBase } from './entity.base'

class AutomapCycleFormEntity extends EntityBase<AutomapCycleFormEntity> {
  @AutoMap()
  id: string

  @AutoMap({ type: () => AutomapCycleCategoryEntity })
  category: any
}

class AutomapCycleCategoryEntity extends EntityBase<AutomapCycleCategoryEntity> {
  @AutoMap()
  id: string

  @AutoMap({ type: () => AutomapCycleFormEntity })
  form: any
}

describe('EntityBase automap cycle', () => {
  it('should keep canonical references without infinite recursion', () => {
    const rawCategory: any = {
      id: 'category-1',
    }

    const rawForm: any = {
      id: 'form-1',
      category: rawCategory,
    }

    rawCategory.form = rawForm

    const category = new AutomapCycleCategoryEntity()
    category.automap(rawCategory)

    expect(category.form).toBeDefined()
    expect(category.form.category).toBe(category)
  })
})
