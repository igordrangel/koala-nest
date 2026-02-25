import {
  createAutomapContext,
  mapEntityReference,
} from './automap-cycle-context'

class CycleRootEntity {
  _action = 0
  child: CycleChildEntity
  automapCalls = 0

  automap(data: any, context: ReturnType<typeof createAutomapContext>) {
    this.automapCalls += 1

    if (data.child) {
      this.child = mapEntityReference(
        data.child,
        CycleChildEntity,
        context,
        this._action,
      )
    }
  }
}

class CycleChildEntity {
  _action = 0
  parent: CycleRootEntity
  automapCalls = 0

  automap(data: any, context: ReturnType<typeof createAutomapContext>) {
    this.automapCalls += 1

    if (data.parent) {
      this.parent = mapEntityReference(
        data.parent,
        CycleRootEntity,
        context,
        this._action,
      )
    }
  }
}

class ListCycleRootEntity {
  _action = 0
  children: ListCycleChildEntity[] = []
  automapCalls = 0

  automap(data: any, context: ReturnType<typeof createAutomapContext>) {
    this.automapCalls += 1

    if (Array.isArray(data.children)) {
      this.children = data.children.map((child: any) =>
        mapEntityReference(child, ListCycleChildEntity, context, this._action),
      )
    }
  }
}

class ListCycleChildEntity {
  _action = 0
  parent: ListCycleRootEntity
  automapCalls = 0

  automap(data: any, context: ReturnType<typeof createAutomapContext>) {
    this.automapCalls += 1

    if (data.parent) {
      this.parent = mapEntityReference(
        data.parent,
        ListCycleRootEntity,
        context,
        this._action,
      )
    }
  }
}

describe('automap-cycle-context util', () => {
  it('should keep canonical instance for cyclic references', () => {
    const context = createAutomapContext()

    const rawRoot: any = { id: 'root-1' }
    const rawChild: any = { id: 'child-1' }

    rawRoot.child = rawChild
    rawChild.parent = rawRoot

    const root = mapEntityReference(rawRoot, CycleRootEntity, context, 2)

    expect(root.child.parent).toBe(root)
    expect(root.automapCalls).toBe(1)
    expect(root.child.automapCalls).toBe(1)
  })

  it('should return cached instance for same source object', () => {
    const context = createAutomapContext()
    const rawRoot = { id: 'root-1' }

    const first = mapEntityReference(rawRoot, CycleRootEntity, context, 2)
    const second = mapEntityReference(rawRoot, CycleRootEntity, context, 2)

    expect(second).toBe(first)
  })

  it('should keep primitive passthrough', () => {
    const context = createAutomapContext()

    expect(mapEntityReference('x', CycleRootEntity, context, 1)).toBe('x')
    expect(mapEntityReference(10, CycleRootEntity, context, 1)).toBe(10)
    expect(mapEntityReference(null, CycleRootEntity, context, 1)).toBeNull()
  })

  it('should preserve canonical root when cycle comes from collection items', () => {
    const context = createAutomapContext()

    const rawRoot: any = { id: 'root-1' }
    const rawChildA: any = { id: 'child-a', parent: rawRoot }
    const rawChildB: any = { id: 'child-b', parent: rawRoot }

    rawRoot.children = [rawChildA, rawChildB]

    const root = mapEntityReference(rawRoot, ListCycleRootEntity, context, 2)

    expect(root.children).toHaveLength(2)
    expect(root.children[0].parent).toBe(root)
    expect(root.children[1].parent).toBe(root)
    expect(root.automapCalls).toBe(1)
    expect(root.children[0].automapCalls).toBe(1)
    expect(root.children[1].automapCalls).toBe(1)
  })

  it('should reuse same mapped child instance when source child is duplicated in array', () => {
    const context = createAutomapContext()

    const rawRoot: any = { id: 'root-1' }
    const duplicatedRawChild: any = { id: 'child-a', parent: rawRoot }

    rawRoot.children = [duplicatedRawChild, duplicatedRawChild]

    const root = mapEntityReference(rawRoot, ListCycleRootEntity, context, 2)

    expect(root.children).toHaveLength(2)
    expect(root.children[0]).toBe(root.children[1])
    expect(root.children[0].parent).toBe(root)
    expect(root.children[0].automapCalls).toBe(1)
  })
})
