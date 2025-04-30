import { List } from './list'

export function findOnList<T>(
  list: List<T>,
  ...predicates: ((item: T) => boolean)[]
) {
  let result: T | null = null

  for (const predicate of predicates) {
    result = list.find(predicate)

    if (result) {
      break
    }
  }

  return result
}
