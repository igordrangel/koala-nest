/// <reference types="bun-types/test-globals" />

import { ListResponseBase } from '@/core/common/list-response.base';
import { PaginationDto } from '@/domain/dtos/pagination.dto';
import { describe, expect, it } from 'bun:test';

class QueryPersonDto extends PaginationDto {
  name?: string;
}

class PersonListItem {
  id!: number;
  name!: string;
}

class PersonListResponse extends ListResponseBase<PersonListItem> {}

describe('PaginationDto.from', () => {
  it('cria instância com props parciais herdando defaults', () => {
    const query = QueryPersonDto.from({ name: 'Jane', limit: 50 });

    expect(query).toBeInstanceOf(QueryPersonDto);
    expect(query.name).toBe('Jane');
    expect(query.limit).toBe(50);
    expect(query.page).toBe(0);
  });
});

describe('ListResponseBase.from', () => {
  it('cria resposta paginada via ObjectClass.from', () => {
    const response = PersonListResponse.from({
      items: [{ id: 1, name: 'Jane' }],
      count: 1,
    });

    expect(response.items).toHaveLength(1);
    expect(response.count).toBe(1);
  });
});
