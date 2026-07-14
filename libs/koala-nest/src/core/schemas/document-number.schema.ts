import {
  isCnpjDocument,
  isCpfDocument,
} from '@/core/schemas/document-number.utils';

export function documentNumberSchema(value: string) {
  if (value === '' || value === 'undefined' || value === 'null') {
    return true;
  }

  if (isCpfDocument(value)) {
    return value.validateCpf();
  }

  if (isCnpjDocument(value)) {
    return value.validateCnpj();
  }

  return false;
}
