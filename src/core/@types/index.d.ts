/**
 * Make some property optional on type
 *
 * @example
 * ```typescript
 * type Post {
 *  id: string;
 *  name: string;
 *  email: string;
 * }
 *
 * Optional<Post, 'id' | 'email' >
 * ```
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Override props on type
 *
 * @example
 * ```typescript
 * type Post {
 *  id: string;
 *  name: string;
 *  email: string;
 * }
 *
 * Overwrite<Post, { id: number }>
 * ```
 */
export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type CreatedRegister<TypeId = string> = {
  id: TypeId
}

export type ListResponse<TItem = any> = {
  items: Array<TItem>
  count: number
}

export type FileResponse = {
  filename: string
  type: string
  base64: string
}
