export type QueryDirectionType = 'asc' | 'desc';
export interface ListResponse<T> {
  items: T[];
  count: number;
}
