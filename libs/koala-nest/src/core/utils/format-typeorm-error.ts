import { HttpStatus } from '@nestjs/common';
import {
  EntityNotFoundError,
  OptimisticLockVersionMismatchError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';

export interface FieldError {
  field: string;
  message: string;
}

export interface FormattedTypeOrmError {
  statusCode: HttpStatus;
  message: string;
  errors?: FieldError[];
}

interface PostgresDriverError {
  code?: string;
  detail?: string;
  constraint?: string;
  table?: string;
  column?: string;
  message?: string;
}

const POSTGRES_ERROR_MESSAGES: Record<
  string,
  (field?: string) => { message: string; statusCode: HttpStatus }
> = {
  '23505': (field) => ({
    statusCode: HttpStatus.CONFLICT,
    message: field
      ? `Já existe um registro com este valor para o campo ${field}.`
      : 'Já existe um registro com este valor.',
  }),
  '23503': (field) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: field
      ? `O valor informado para o campo ${field} não possui um registro relacionado.`
      : 'O registro referenciado não foi encontrado.',
  }),
  '23502': (field) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: field
      ? `O campo ${field} é obrigatório.`
      : 'Um ou mais campos obrigatórios não foram informados.',
  }),
  '23514': (field) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: field
      ? `O valor informado para o campo ${field} é inválido.`
      : 'Um ou mais valores informados são inválidos.',
  }),
  '22P02': () => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Formato de dado inválido.',
  }),
  '22001': (field) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: field
      ? `O valor informado para o campo ${field} é muito longo.`
      : 'Um ou mais valores informados são muito longos.',
  }),
  '22003': (field) => ({
    statusCode: HttpStatus.BAD_REQUEST,
    message: field
      ? `O valor informado para o campo ${field} está fora do intervalo permitido.`
      : 'Um ou mais valores numéricos estão fora do intervalo permitido.',
  }),
};

function extractFieldFromDetail(detail?: string): string | undefined {
  if (!detail) {
    return undefined;
  }

  const keyMatch = detail.match(/Key \(([^)]+)\)=/);
  if (keyMatch) {
    return keyMatch[1];
  }

  const nullColumnMatch = detail.match(/null value in column "([^"]+)"/);
  if (nullColumnMatch) {
    return nullColumnMatch[1];
  }

  return undefined;
}

function getPostgresDriverError(
  exception: QueryFailedError,
): PostgresDriverError | undefined {
  const driverError = exception.driverError;

  if (!driverError || typeof driverError !== 'object') {
    return undefined;
  }

  return driverError;
}

function formatQueryFailedError(
  exception: QueryFailedError,
): FormattedTypeOrmError {
  const driverError = getPostgresDriverError(exception);
  const field =
    driverError?.column ?? extractFieldFromDetail(driverError?.detail);
  const mapped = driverError?.code
    ? POSTGRES_ERROR_MESSAGES[driverError.code]?.(field)
    : undefined;

  if (mapped) {
    return {
      statusCode: mapped.statusCode,
      message: mapped.message,
      errors: field ? [{ field, message: mapped.message }] : undefined,
    };
  }

  return {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Não foi possível processar a operação no banco de dados.',
  };
}

function formatEntityNotFoundError(): FormattedTypeOrmError {
  return {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Registro não encontrado.',
  };
}

function formatOptimisticLockError(): FormattedTypeOrmError {
  return {
    statusCode: HttpStatus.CONFLICT,
    message:
      'O registro foi alterado por outra operação. Atualize os dados e tente novamente.',
  };
}

function formatGenericTypeOrmError(
  exception: TypeORMError,
): FormattedTypeOrmError {
  return {
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    message: exception.message || 'Erro interno ao acessar o banco de dados.',
  };
}

export function formatTypeOrmError(
  exception: TypeORMError,
): FormattedTypeOrmError {
  if (exception instanceof QueryFailedError) {
    return formatQueryFailedError(exception);
  }

  if (exception instanceof EntityNotFoundError) {
    return formatEntityNotFoundError();
  }

  if (exception instanceof OptimisticLockVersionMismatchError) {
    return formatOptimisticLockError();
  }

  return formatGenericTypeOrmError(exception);
}

export function isTypeOrmError(exception: Error): exception is TypeORMError {
  return exception instanceof TypeORMError;
}
