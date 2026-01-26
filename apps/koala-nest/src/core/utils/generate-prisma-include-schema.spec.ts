import { EntityBase } from '../database/entity.base'
import { Entity } from '../database/entity.decorator'
import { AutoMap } from '../mapping/auto-mapping.decorator'
import { generateIncludeSchema } from './generate-prisma-include-schema'

@Entity()
export class ClasseA extends EntityBase<ClasseA> {
  @AutoMap({ type: () => ClasseB })
  classB = undefined
}

@Entity()
export class ClasseB extends EntityBase<ClasseB> {
  @AutoMap({ type: () => ClasseA })
  classA = undefined

  @AutoMap({ type: () => ClasseC })
  classC = undefined
}

@Entity()
export class ClasseC extends EntityBase<ClasseC> {
  @AutoMap({ type: () => ClasseA })
  classA = undefined
}

describe('generateIncludeSchema', () => {
  it('should generate include schema with deepLimit 1', () => {
    const include = generateIncludeSchema({
      deepLimit: 5,
      entity: ClasseA,
    })

    expect(include).toEqual({
      classB: {
        classA: {
          classB: {
            classA: {
              classB: true,
            },
            classC: {
              classA: true,
            },
          },
        },
        classC: {
          classA: {
            classB: {
              classA: true,
              classC: true,
            },
          },
        },
      },
    })
  })
})
