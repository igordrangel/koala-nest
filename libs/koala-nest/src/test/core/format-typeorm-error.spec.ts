import { describe, expect, it } from 'bun:test';
import { HttpStatus } from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import {
  formatTypeOrmError,
  isTypeOrmError,
} from '@/core/utils/format-typeorm-error';

describe('formatTypeOrmError', () => {
  it('identifica erros TypeORM', () => {
    const error = new EntityNotFoundError('person', { id: 1 });

    expect(isTypeOrmError(error)).toBe(true);
  });

  it('formata EntityNotFoundError como 404', () => {
    const formatted = formatTypeOrmError(
      new EntityNotFoundError('person', { id: 1 }),
    );

    expect(formatted.statusCode).toBe(HttpStatus.NOT_FOUND);
    expect(formatted.message).toBe('Registro não encontrado.');
  });

  it('formata violação de unique do Postgres como 409', () => {
    const driverError = {
      code: '23505',
      detail: 'Key (email)=(user@example.com) already exists.',
      column: 'email',
    };
    const error = new QueryFailedError(
      'INSERT INTO person',
      [],
      driverError as Error,
    );

    const formatted = formatTypeOrmError(error);

    expect(formatted.statusCode).toBe(HttpStatus.CONFLICT);
    expect(formatted.message).toContain('email');
  });
});
