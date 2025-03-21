import { Type } from '@nestjs/common'
import 'reflect-metadata'
import { EntityBase } from '../database/entity.base'
import { IComparableId } from './interfaces/icomparable'

export type ListActionType = 'added' | 'updated' | 'removed'
export interface ListProps<T> {
  list?: T[]
  entityType?: Type<T>
}

export class List<T> {
  private _list: T[] = []
  private _addedItemsList: T[] = []
  private _updatedItemsList: T[] = []
  private _removedItemsList: T[] = []

  constructor(public readonly entityType?: Type<T>) {}

  get length() {
    return this._list.length
  }

  findById(id: IComparableId): T | null {
    return (
      this._list
        .filter((item) => item instanceof EntityBase)
        .find((item) => (item as any)._id === id || (item as any).id === id) ??
      null
    )
  }

  findByValue(value: any): T | null {
    return this._list.find((item) => item === value) ?? null
  }

  setList(list: T[]) {
    this._list = this.mapInternalIdIfIsEmpty(list)
    return this
  }

  add(item: T) {
    if (this.contains(item)) {
      this._list[this.indexOf(item)] = item

      if (!this.contains(item, this._updatedItemsList)) {
        this._updatedItemsList.push(item)
      }

      return
    }

    this._list.push(item)
    this._addedItemsList.push(item)

    return this
  }

  remove(item: T) {
    const index = this.indexOf(item)

    if (index > -1) {
      this._list.splice(index, 1)

      if (!this.contains(item, this._removedItemsList)) {
        this._removedItemsList.push(item)
      }
    }

    return this
  }

  update(items: T[]) {
    items = this.mapInternalIdIfIsEmpty(items)

    items.forEach((item) => this.add(item))

    this._list
      .filter((item) => !this.contains(item, items))
      .forEach((item) => this.remove(item))

    return this
  }

  clear() {
    this._addedItemsList = []
    this._updatedItemsList = []
    this._removedItemsList = this._list
    this._list = []

    return this
  }

  forEach(callback: (item: T, index: number) => void) {
    this._list.forEach(callback)
    return this
  }

  async forEachAsync(callback: (item: T, index: number) => Promise<void>) {
    return Promise.all(this._list.map(callback)).then(() => this)
  }

  map<U>(callback: (item: T, index: number) => U): List<U> {
    const mappedItems = this._list.map(callback)
    const list = new List<U>()

    list.setList(mappedItems)

    return list
  }

  async mapAsync<U>(
    callback: (item: T, index: number) => Promise<U>,
  ): Promise<List<U>> {
    return Promise.all(this._list.map(callback)).then((mappedItems) => {
      const mappedList = new List<U>()

      mappedList.setList(mappedItems)

      return mappedList
    })
  }

  filter(callback: (item: T, index: number) => boolean): List<T> {
    const filteredItems = this._list.filter(callback)
    const list = new List<T>()

    list.setList(filteredItems)

    return list
  }

  async filterAsync(
    callback: (item: T, index: number) => Promise<boolean>,
  ): Promise<List<T>> {
    return Promise.all(this._list.filter(callback))
      .then((list) => list.filter((item) => item))
      .then((filteredItems) => {
        const list = new List<T>()

        list.setList(filteredItems)

        return list
      })
  }

  find(callback: (item: T, index: number) => boolean): T | null {
    return this._list.find(callback) ?? null
  }

  toArray(type?: ListActionType): T[] {
    switch (type) {
      case 'added':
        return this._addedItemsList
      case 'updated':
        return this._updatedItemsList
      case 'removed':
        return this._removedItemsList
      default:
        return this._list
    }
  }

  private indexOf(item: T, list = this._list) {
    if (item instanceof EntityBase) {
      return list
        .filter((i) => i instanceof EntityBase)
        .findIndex(
          (i) =>
            (item as any)._id === (i as any)._id ||
            (item as any).id === (i as any).id,
        )
    }

    return list
      .filter((i) => !(i instanceof EntityBase))
      .findIndex((i) => item === i)
  }

  private contains(item: T, list = this._list): boolean {
    return this.indexOf(item, list) > -1
  }

  private mapInternalIdIfIsEmpty(list: T[]) {
    return list.map((item) => {
      if (item instanceof EntityBase && !item._id) {
        item._id = (item as any).id
      }

      return item
    })
  }
}
