---
title: Tratamento de erros
slug: tratamento-de-erros
category: host
docKey: host/tratamento-de-erros
order: 3
description: Filtro global ErrorsFilter para Zod, TypeORM e erros internos.
---

# Tratamento de erros

O `ErrorsFilter` é registrado globalmente em `main.ts` e padroniza respostas de erro para validação Zod, erros TypeORM e falhas internas.

## Registro global

```typescript
app.useGlobalFilters(new ErrorsFilter());
```

## Implementação

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

## Erros de validação (Zod)

Quando um validator lança `ZodError`, a resposta é HTTP 400 com detalhes por campo:

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

Exemplo de resposta (campo `name` ausente em create):

```json
{
  "statusCode": 400,
  "message": "O campo name é obrigatório.",
  "errors": [
    { "field": "name", "message": "O campo name é obrigatório." }
  ]
}
```

## Erros TypeORM

Violações de constraint (unique, foreign key, etc.) são formatadas com status e mensagem amigável via `formatTypeOrmError()`.

## Exceções HTTP do NestJS

`NotFoundException`, `BadRequestException` e demais `HttpException` seguem o comportamento padrão do NestJS:

```typescript
if (!person) {
  throw new NotFoundException('Pessoa não encontrada');
}
```

## Erros não tratados

Qualquer erro desconhecido retorna HTTP 500 com mensagem genérica. O stack trace é registrado no logger interno, sem expor detalhes ao cliente.

## Formato de resposta

```typescript
interface ErrorResponse {
  statusCode: HttpStatus;
  message: string;
  errors?: ZodFieldError[];
}
```
