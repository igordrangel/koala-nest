import { ZodError } from 'zod';

type ZodValidationIssue = ZodError['issues'][number];

export interface ZodFieldError {
  field: string;
  message: string;
}

export interface FormattedZodError {
  message: string;
  errors: ZodFieldError[];
}

const TYPE_LABELS: Record<string, string> = {
  string: 'texto',
  number: 'número',
  int: 'número inteiro',
  boolean: 'booleano',
  array: 'lista',
  object: 'objeto',
  undefined: 'indefinido',
  null: 'nulo',
};

function formatFieldPath(path: PropertyKey[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }

    const segmentLabel = String(segment);

    return acc ? `${acc}.${segmentLabel}` : segmentLabel;
  }, '');
}

function formatFieldLabel(field: string): string {
  return field || 'valor';
}

function getExpectedTypeLabel(expected: string): string {
  return TYPE_LABELS[expected] ?? expected;
}

function getReceivedTypeLabel(message: string): string | undefined {
  const match = message.match(/received (\w+)/i);
  if (!match) {
    return undefined;
  }

  return getExpectedTypeLabel(match[1].toLowerCase());
}

function formatLimitValue(value: number | bigint | undefined): number {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  return value ?? 0;
}

function formatTooSmallMessage(
  fieldLabel: string,
  issue: ZodValidationIssue,
): string {
  if (issue.code !== 'too_small') {
    return `O campo ${fieldLabel} possui um valor muito pequeno.`;
  }

  const minimum = formatLimitValue(issue.minimum);

  if (issue.origin === 'string') {
    if (minimum <= 1) {
      return `O campo ${fieldLabel} é obrigatório.`;
    }

    return `O campo ${fieldLabel} deve ter no mínimo ${minimum} caracteres.`;
  }

  if (issue.origin === 'number') {
    if (issue.inclusive === false) {
      return `O campo ${fieldLabel} deve ser maior que ${minimum}.`;
    }

    return `O campo ${fieldLabel} deve ser no mínimo ${minimum}.`;
  }

  if (issue.origin === 'array') {
    if (minimum <= 1) {
      return `O campo ${fieldLabel} deve conter ao menos um item.`;
    }

    return `O campo ${fieldLabel} deve conter no mínimo ${minimum} itens.`;
  }

  return `O campo ${fieldLabel} possui um valor muito pequeno.`;
}

function formatTooBigMessage(
  fieldLabel: string,
  issue: ZodValidationIssue,
): string {
  if (issue.code !== 'too_big') {
    return `O campo ${fieldLabel} possui um valor muito grande.`;
  }

  const maximum = formatLimitValue(issue.maximum);

  if (issue.origin === 'string') {
    return `O campo ${fieldLabel} deve ter no máximo ${maximum} caracteres.`;
  }

  if (issue.origin === 'number') {
    return `O campo ${fieldLabel} deve ser no máximo ${maximum}.`;
  }

  if (issue.origin === 'array') {
    return `O campo ${fieldLabel} deve conter no máximo ${maximum} itens.`;
  }

  return `O campo ${fieldLabel} possui um valor muito grande.`;
}

function formatInvalidTypeMessage(
  fieldLabel: string,
  issue: ZodValidationIssue,
): string {
  if (issue.code !== 'invalid_type') {
    return `O campo ${fieldLabel} possui um valor inválido.`;
  }

  const expected = issue.expected
    ? getExpectedTypeLabel(issue.expected)
    : 'válido';
  const received = getReceivedTypeLabel(issue.message);

  if (issue.expected === 'undefined' || received === 'indefinido') {
    return `O campo ${fieldLabel} é obrigatório.`;
  }

  if (received) {
    return `O campo ${fieldLabel} deve ser ${expected}, mas foi recebido ${received}.`;
  }

  return `O campo ${fieldLabel} deve ser ${expected}.`;
}

function formatInvalidFormatMessage(
  fieldLabel: string,
  issue: ZodValidationIssue,
): string {
  if (issue.code !== 'invalid_format') {
    return `O campo ${fieldLabel} está em um formato inválido.`;
  }

  switch (issue.format) {
    case 'email':
      return `O campo ${fieldLabel} deve ser um e-mail válido.`;
    case 'uuid':
      return `O campo ${fieldLabel} deve ser um UUID válido.`;
    case 'url':
      return `O campo ${fieldLabel} deve ser uma URL válida.`;
    default:
      return `O campo ${fieldLabel} está em um formato inválido.`;
  }
}

function formatIssueMessage(issue: ZodValidationIssue): string {
  const field = formatFieldPath(issue.path);
  const fieldLabel = formatFieldLabel(field);

  switch (issue.code) {
    case 'too_small':
      return formatTooSmallMessage(fieldLabel, issue);
    case 'too_big':
      return formatTooBigMessage(fieldLabel, issue);
    case 'invalid_type':
      return formatInvalidTypeMessage(fieldLabel, issue);
    case 'invalid_format':
      return formatInvalidFormatMessage(fieldLabel, issue);
    case 'invalid_value':
      return `O campo ${fieldLabel} possui um valor inválido.`;
    default:
      return `O campo ${fieldLabel} possui um valor inválido.`;
  }
}

export function formatZodError(error: ZodError): FormattedZodError {
  const errors = error.issues.map((issue) => ({
    field: formatFieldPath(issue.path),
    message: formatIssueMessage(issue),
  }));

  const message =
    errors.length === 1
      ? errors[0].message
      : `Foram encontrados ${errors.length} erros de validação.`;

  return { message, errors };
}
