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
    return unmaskDocumentNumber(document).maskCpf();
  }

  if (isCnpjDocument(document)) {
    return unmaskDocumentNumber(document).maskCnpj();
  }

  return document;
}
