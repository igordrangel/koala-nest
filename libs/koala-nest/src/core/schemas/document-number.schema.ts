function isValidCpf(value: string) {
  if (!/^\d{11}$/.test(value) || /^(\d)\1+$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const calcDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * (length + 1 - index), 0);

    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calcDigit(9) === digits[9] && calcDigit(10) === digits[10];
}

function isValidCnpj(value: string) {
  if (!/^\d{14}$/.test(value) || /^(\d)\1+$/.test(value)) {
    return false;
  }

  const digits = value.split('').map(Number);
  const calcDigit = (length: number) => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = digits
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * weights[index], 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return calcDigit(12) === digits[12] && calcDigit(13) === digits[13];
}

export function documentNumberSchema(value: string) {
  if (value === '' || value === 'undefined' || value === 'null') {
    return true;
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return isValidCpf(digits);
  }

  if (digits.length === 14) {
    return isValidCnpj(digits);
  }

  return false;
}
