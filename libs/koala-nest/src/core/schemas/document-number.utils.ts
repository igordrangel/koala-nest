const DOCUMENT_MASK_PATTERN = /[/.-\s]/gi;

export function unmaskDocumentNumber(value: string): string {
  return value.replace(DOCUMENT_MASK_PATTERN, '').toUpperCase();
}

export function isCpfDocument(value: string): boolean {
  const unmasked = unmaskDocumentNumber(value);

  return unmasked.length === 11 && /^\d{11}$/.test(unmasked);
}

export function isCnpjDocument(value: string): boolean {
  return unmaskDocumentNumber(value).length === 14;
}
