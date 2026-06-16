import { QUERY_FILTER_PARAMS } from '@/core/constants/query-params';
import { AutoMap } from '@/core/tools/mapping';
import type { QueryDirectionType } from '@/core/types';
import type {
  FindOptionsOrder,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

type OrderDirection = 'ASC' | 'DESC';

function normalizeDirection(
  direction?: QueryDirectionType | string,
): OrderDirection {
  return String(direction ?? 'asc').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
}

function flattenOrderBy(
  order: Record<string, unknown>,
  prefix = '',
): Array<{ path: string; direction: OrderDirection }> {
  const entries: Array<{ path: string; direction: OrderDirection }> = [];

  for (const [key, value] of Object.entries(order)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      entries.push({ path, direction: normalizeDirection(value) });
      continue;
    }

    if (value && typeof value === 'object') {
      entries.push(...flattenOrderBy(value as Record<string, unknown>, path));
    }
  }

  return entries;
}

function normalizeFindOptionsOrder(
  order: Record<string, unknown>,
): FindOptionsOrder<ObjectLiteral> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(order)) {
    if (typeof value === 'string') {
      normalized[key] = normalizeDirection(value);
    } else if (value && typeof value === 'object') {
      normalized[key] = normalizeFindOptionsOrder(
        value as Record<string, unknown>,
      );
    } else {
      normalized[key] = value;
    }
  }

  return normalized as FindOptionsOrder<ObjectLiteral>;
}

export class PaginationDto {
  @AutoMap()
  page?: number = 0;

  @AutoMap()
  limit?: number = QUERY_FILTER_PARAMS.limit;

  @AutoMap()
  orderBy?: string = '';

  @AutoMap()
  direction?: QueryDirectionType = 'asc';

  skip() {
    return (this.limit ?? 0) * (this.page ?? QUERY_FILTER_PARAMS.page);
  }

  generateOrderBy(): Record<string, unknown> | undefined {
    if (this.orderBy) {
      const orderByField = this.orderBy.split('.');
      return orderByField.reduceRight(
        (acc, item, index) => ({
          [item]: index === orderByField.length - 1 ? this.direction : acc,
        }),
        {} as Record<string, unknown>,
      );
    }

    return undefined;
  }

  toFindOptionsOrder(): FindOptionsOrder<ObjectLiteral> | undefined {
    const order = this.generateOrderBy();

    if (!order) {
      return undefined;
    }

    return normalizeFindOptionsOrder(order);
  }

  applyQueryBuilderPagination<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    alias: string,
  ): SelectQueryBuilder<T> {
    const order = this.generateOrderBy();

    if (order) {
      for (const { path, direction } of flattenOrderBy(order)) {
        const sortPath = path.includes('.') ? path : `${alias}.${path}`;
        qb.addOrderBy(sortPath, direction);
      }
    }

    return qb.skip(this.skip()).take(this.limit);
  }

  static from<T extends PaginationDto>(this: new () => T, props: Partial<T>): T {
    return Object.assign(new this(), props);
  }
}
