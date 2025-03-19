export type IComparableId = string | number

export abstract class IComparable<T = any> {
  abstract id: IComparableId
  abstract equals(obj: IComparable<T>): boolean
}
