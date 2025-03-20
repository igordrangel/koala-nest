export type IComparableId = string | number

export abstract class IComparable<T = any> {
  abstract _id: IComparableId
  abstract equals(obj: IComparable<T>): boolean
}
