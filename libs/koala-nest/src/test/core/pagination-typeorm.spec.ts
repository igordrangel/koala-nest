/// <reference types="bun-types/test-globals" />

import { PaginationDto } from '@/domain/dtos/pagination.dto';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { describe, expect, it } from 'bun:test';

describe('PaginationDto TypeORM', () => {
  it('toFindOptionsOrder normaliza direction para ASC/DESC', () => {
    const query = PaginationDto.from({ orderBy: 'name', direction: 'desc' });

    expect(query.toFindOptionsOrder()).toEqual({ name: 'DESC' });
  });

  it('toFindOptionsOrder suporta ordenação aninhada', () => {
    const query = PaginationDto.from({
      orderBy: 'address.city',
      direction: 'asc',
    });

    expect(query.toFindOptionsOrder()).toEqual({
      address: { city: 'ASC' },
    });
  });

  it('applyQueryBuilderPagination aplica order, skip e take', () => {
    const qb = {
      expressionMap: {
        orderBys: {} as Record<string, string>,
        skip: 0,
        take: 0,
      },
      addOrderBy(path: string, direction: string) {
        this.expressionMap.orderBys[path] = direction;
        return this;
      },
      skip(value: number) {
        this.expressionMap.skip = value;
        return this;
      },
      take(value: number) {
        this.expressionMap.take = value;
        return this;
      },
    };
    const query = PaginationDto.from({
      page: 1,
      limit: 10,
      orderBy: 'name',
      direction: 'desc',
    });

    const result = query.applyQueryBuilderPagination(qb as never, 'entity');

    expect(result.expressionMap.orderBys).toEqual({ 'entity.name': 'DESC' });
    expect(result.expressionMap.skip).toBe(10);
    expect(result.expressionMap.take).toBe(10);
  });
});

describe('PersonQueryDto default sort', () => {
  it('usa id asc quando orderBy não é informado', () => {
    const query = PersonQueryDto.from({ name: 'Jane' });

    expect(query.generateOrderBy()).toEqual({ id: 'asc' });
    expect(query.toFindOptionsOrder()).toEqual({ id: 'ASC' });
  });

  it('delega para PaginationDto quando orderBy é informado', () => {
    const query = PersonQueryDto.from({ orderBy: 'name', direction: 'desc' });

    expect(query.generateOrderBy()).toEqual({ name: 'desc' });
    expect(query.toFindOptionsOrder()).toEqual({ name: 'DESC' });
  });
});
