import { AutoMap } from './auto-mapping.decorator'
import { AutoMappingProfile } from './auto-mapping-profile'
import { AutoMappingService } from './auto-mapping.service'
import { createMap } from './create-map'

class MappingCycleFormSource {
  @AutoMap()
  id: string

  @AutoMap({ type: () => MappingCycleCategorySource })
  category: any
}

class MappingCycleCategorySource {
  @AutoMap()
  id: string

  @AutoMap({ type: () => MappingCycleFormSource })
  form: any
}

class MappingCycleFormResponse {
  @AutoMap()
  id: string

  @AutoMap({ type: () => MappingCycleCategoryResponse })
  category: any
}

class MappingCycleCategoryResponse {
  @AutoMap()
  id: string

  @AutoMap({ type: () => MappingCycleFormResponse })
  form: any
}

class MappingCycleProfile extends AutoMappingProfile {
  profile(): void {
    createMap(MappingCycleCategorySource, MappingCycleCategoryResponse)
    createMap(MappingCycleFormSource, MappingCycleFormResponse)
  }
}

describe('AutoMappingService cycle', () => {
  it('should cut relation when type returns to an ancestor in chain', () => {
    const service = new AutoMappingService(new MappingCycleProfile())

    const category = new MappingCycleCategorySource()
    category.id = 'category-1'

    const form = new MappingCycleFormSource()
    form.id = 'form-1'

    category.form = form
    form.category = category

    const response = service.map(
      category,
      MappingCycleCategorySource,
      MappingCycleCategoryResponse,
    )

    expect(response.form.category).toEqual({ id: 'category-1' })
    expect(response.form.id).toBe('form-1')
  })
})
