function maskCpf(value: string) {
  return value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function maskCnpj(value: string) {
  return value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function setMaskDocumentNumber(document?: string) {
  if (!document) {
    return '';
  }

  const digits = document.replace(/\D/g, '');

  return digits.length === 11 ? maskCpf(digits) : maskCnpj(digits);
}
