import { Type } from '@nestjs/common'
import {
  HydrateEntityFromCacheDependencies,
  hydrateEntityFromCache,
} from './hydrate-entity-from-cache'

class RequestEntity {
  id: string
  category: CategoryEntity
  data: DataEntity
}

class CategoryEntity {
  id: string
  form: FormEntity
}

class DataEntity {
  id: string
  form: FormEntity
}

class FormEntity {
  id: string
  name?: string
  fields?: FormFieldEntity[]
}

class FormFieldEntity {
  id: string
  form: FormEntity
}

const allPropsByEntity = new Map<Type<any>, Array<{ name: string }>>([
  [RequestEntity, [{ name: 'id' }, { name: 'category' }, { name: 'data' }]],
  [CategoryEntity, [{ name: 'id' }, { name: 'form' }]],
  [DataEntity, [{ name: 'id' }, { name: 'form' }]],
  [FormEntity, [{ name: 'id' }, { name: 'name' }, { name: 'fields' }]],
  [FormFieldEntity, [{ name: 'id' }, { name: 'form' }]],
])

const propTypeByEntityAndProp = new Map<string, string>([
  ['RequestEntity:category', 'CategoryEntity'],
  ['RequestEntity:data', 'DataEntity'],
  ['CategoryEntity:form', 'FormEntity'],
  ['DataEntity:form', 'FormEntity'],
  ['FormFieldEntity:form', 'FormEntity'],
])

const sourceByName = new Map<string, Type<any>>([
  ['RequestEntity', RequestEntity],
  ['CategoryEntity', CategoryEntity],
  ['DataEntity', DataEntity],
  ['FormEntity', FormEntity],
  ['FormFieldEntity', FormFieldEntity],
])

const listEntityByEntityAndProp = new Map<string, Type<any>>([
  ['FormEntity:fields', FormFieldEntity],
])

const dependencies: HydrateEntityFromCacheDependencies = {
  getAllProps: (entity) => allPropsByEntity.get(entity) ?? [],
  getPropDefinitions: (entity, propName) => ({
    type: propTypeByEntityAndProp.get(`${entity.name}:${propName}`),
  }),
  getSourceByName: (sourceName) => sourceByName.get(sourceName),
  getListEntityType: (entity, propName) =>
    listEntityByEntityAndProp.get(`${entity.name}:${propName}`),
  getIdOnEntity: (_, data) => data.id,
  createEntity: (entity) => new entity(),
}

describe('hydrateEntityFromCache', () => {
  it('should resolve cyclic relation without recursive loop', () => {
    const cache = new Map<string, any>()
    const rootData = {
      id: 'category-1',
      form: {
        id: 'form-1',
      },
    }

    cache.set('FormEntity-form-1', {
      id: 'form-1',
      name: 'Formulário A',
      fields: [
        {
          id: 'field-1',
          form: {
            id: 'form-1',
          },
        },
      ],
    })

    const response = hydrateEntityFromCache({
      entity: CategoryEntity,
      data: rootData,
      cache,
      dependencies,
    })

    expect(response.form.name).toBe('Formulário A')
    expect(response.form.fields[0].form).toBe(response.form)
  })

  it('should reuse same canonical instance across graph branches', () => {
    const cache = new Map<string, any>()
    const rootData = {
      id: 'request-1',
      category: {
        id: 'category-1',
        form: {
          id: 'form-1',
        },
      },
      data: {
        id: 'data-1',
        form: {
          id: 'form-1',
        },
      },
    }

    cache.set('FormEntity-form-1', {
      id: 'form-1',
      name: 'Formulário Compartilhado',
    })

    const response = hydrateEntityFromCache({
      entity: RequestEntity,
      data: rootData,
      cache,
      dependencies,
    })

    expect(response.category.form).toBe(response.data.form)
    expect(response.category.form.name).toBe('Formulário Compartilhado')
  })
})
