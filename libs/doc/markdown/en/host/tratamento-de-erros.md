---
title: Error handling
slug: tratamento-de-erros
category: host
order: 3
description: Global ErrorsFilter for Zod, TypeORM, and internal errors.
---

# Error handling

`ErrorsFilter` is registered globally in `main.ts` and standardizes error responses for Zod validation, TypeORM errors, and internal failures.

## Global registration

```typescript
app.useGlobalFilters(new ErrorsFilter());
```

## Implementation

```typescript
@Catch()
export class ErrorsFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(ErrorsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof ZodError) {
      return this.sendErrorResponse(host, this.handleZodError(exception));
    }

    if (exception instanceof Error && isTypeOrmError(exception)) {
      return this.sendErrorResponse(host, this.handleTypeOrmError(exception));
    }

    if (exception instanceof HttpException) {
      return super.catch(exception, host);
    }

    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logger.error(error.message, error.stack);

    return this.sendErrorResponse(host, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor.',
    });
  }
}
```

## Validation errors (Zod)

When a validator throws `ZodError`, the response is HTTP 400 with per-field details:

```typescript
private handleZodError(exception: ZodError): ErrorResponse {
  const formatted = formatZodError(exception);

  return {
    statusCode: HttpStatus.BAD_REQUEST,
    message: formatted.message,
    errors: formatted.errors,
  };
}
```

Example response (missing `name` field on create):

```json
{
  "statusCode": 400,
  "message": "O campo name é obrigatório.",
  "errors": [
    { "field": "name", "message": "O campo name é obrigatório." }
  ]
}
```

## TypeORM errors

Constraint violations (unique, foreign key, etc.) are formatted with status and a friendly message via `formatTypeOrmError()`.

## NestJS HTTP exceptions

`NotFoundException`, `BadRequestException`, and other `HttpException` types follow NestJS default behavior:

```typescript
if (!person) {
  throw new NotFoundException('Pessoa não encontrada');
}
```

## Unhandled errors

Any unknown error returns HTTP 500 with a generic message. The stack trace is logged internally, without exposing details to the client.

## Response format

```typescript
interface ErrorResponse {
  statusCode: HttpStatus;
  message: string;
  errors?: ZodFieldError[];
}
```
