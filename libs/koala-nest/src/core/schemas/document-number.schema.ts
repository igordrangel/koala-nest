import { validateCpf, validateCnpj } from '@koalarx/utils/KlString';
import {
  isCnpjDocument,
  isCpfDocument,
} from '@/core/schemas/document-number.utils';

export function documentNumberSchema(value: string) {
  if (value === '' || value === 'undefined' || value === 'null') {
    return true;
  }

  if (isCpfDocument(value)) {
    return validateCpf(value);
  }

  if (isCnpjDocument(value)) {
    return validateCnpj(value);
  }

  return false;
}
