import { maskCpf, maskCnpj } from '@koalarx/utils/KlString';
import {
  isCnpjDocument,
  isCpfDocument,
  unmaskDocumentNumber,
} from '@/core/schemas/document-number.utils';

export function setMaskDocumentNumber(document?: string) {
  if (!document) {
    return '';
  }

  if (isCpfDocument(document)) {
    return maskCpf(unmaskDocumentNumber(document));
  }

  if (isCnpjDocument(document)) {
    return maskCnpj(unmaskDocumentNumber(document));
  }

  return document;
}
