import { describe, expect, it } from 'bun:test';
import { booleanSchema, envBooleanSchema } from '@/core/schemas/boolean.schema';
import { documentNumberSchema } from '@/core/schemas/document-number.schema';
import { setMaskDocumentNumber } from '@/core/schemas/document-number-mask';
import { emailSchema } from '@/core/schemas/email.schema';
import { LIST_QUERY_SCHEMA } from '@/core/schemas/list-query.schema';
import { nativeEnumSchema } from '@/core/schemas/native-enum.schema';
import {
  personAddressSchema,
  personBodySchema,
  personContactSchema,
} from '@/application/person/person.schemas';

enum Status {
  ACTIVE = 1,
  INACTIVE = 2,
}

describe('core/schemas', () => {
  it('booleanSchema converte query string para boolean', () => {
    const schema = booleanSchema();

    expect(schema.parse('true')).toBe(true);
    expect(schema.parse('false')).toBe(false);
    expect(schema.parse(undefined)).toBeUndefined();
  });

  it('envBooleanSchema interpreta "false" como false', () => {
    const schema = envBooleanSchema(false);

    expect(schema.parse('false')).toBe(false);
    expect(schema.parse('true')).toBe(true);
    expect(schema.parse(undefined)).toBe(false);
  });

  it('emailSchema valida e-mails opcionais e obrigatórios', () => {
    expect(emailSchema('user@example.com')).toBe(true);
    expect(emailSchema(undefined)).toBe(true);
    expect(emailSchema(undefined, true)).toBe(false);
    expect(emailSchema('invalid', true)).toBe(false);
  });

  it('nativeEnumSchema resolve enums numéricos', () => {
    const schema = nativeEnumSchema(Status);

    expect(schema.isRequired('1')).toBe(Status.ACTIVE);
    expect(schema.isOptional('')).toBeUndefined();
  });

  it('documentNumberSchema valida CPF e CNPJ', () => {
    expect(documentNumberSchema('529.982.247-25')).toBe(true);
    expect(documentNumberSchema('11.222.333/0001-81')).toBe(true);
    expect(documentNumberSchema('123')).toBe(false);
  });

  it('setMaskDocumentNumber aplica máscara de CPF e CNPJ', () => {
    expect(setMaskDocumentNumber('52998224725')).toBe('529.982.247-25');
    expect(setMaskDocumentNumber('11222333000181')).toBe('11.222.333/0001-81');
  });

  it('LIST_QUERY_SCHEMA converte page 1-based para índice zero-based', () => {
    expect(LIST_QUERY_SCHEMA.parse({ page: '2' }).page).toBe(1);
    expect(LIST_QUERY_SCHEMA.parse({ page: '1' }).page).toBe(0);
    expect(LIST_QUERY_SCHEMA.parse({}).page).toBeUndefined();
  });

  it('personBodySchema valida create e update de pessoa', () => {
    expect(
      personBodySchema().parse({
        name: 'Jane',
        address: { address: 'Street' },
        contacts: [{ contact: 'jane@example.com' }],
      }).name,
    ).toBe('Jane');

    expect(
      personBodySchema(true).parse({
        id: 1,
        name: 'Jane',
        address: { id: 2, address: 'Street' },
        contacts: [{ id: 3, contact: 'jane@example.com' }],
      }).id,
    ).toBe(1);

    expect(
      personAddressSchema(true).parse({ id: 1, address: 'Street' }).id,
    ).toBe(1);

    expect(
      personContactSchema(true).parse({ id: 1, contact: 'a@b.com' }).contact,
    ).toBe('a@b.com');
  });
});
