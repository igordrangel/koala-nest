# Tratamento de Erros

A biblioteca fornece um sistema robusto de tratamento de erros usando `RequestResult` (Either pattern) que retorna erros em vez de lançá-los com `throw`.

## Erros Predefinidos

### 1. ResourceNotFoundError

Lançado quando um recurso não é encontrado.

```typescript
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'

return failure(new ResourceNotFoundError('Pessoa'))
// Retorna: 404 Not Found
```

### 2. ConflictError

Lançado quando há conflito (ex: duplicação de dados).

```typescript
import { ConflictError } from '@koalarx/nest/core/errors/conflict.error'

throw new ConflictError('Email already registered')
// Retorna: 409 Conflict
```

### 3. BadRequestError

Lançado quando a requisição contém dados inválidos (via Zod).

```typescript
import { BadRequestError } from '@koalarx/nest/core/errors/bad-request.error'

throw new BadRequestError('Invalid user data')
// Retorna: 400 Bad Request
```

### 4. NotAllowedError

Lançado quando a operação não é permitida.

```typescript
import { NotAllowedError } from '@koalarx/nest/core/errors/not-allowed.error'

throw new NotAllowedError('This action is not allowed')
// Retorna: 400 Bad Request
```

### 5. WrongCredentialsError

Lançado quando credenciais são inválidas.

```typescript
import { WrongCredentialsError } from '@koalarx/nest/core/errors/wrong-credentials.error'

throw new WrongCredentialsError('Invalid email or password')
// Retorna: 401 Unauthorized
```

### 6. NoContentError

Lançado quando não há conteúdo para retornar.

```typescript
import { NoContentError } from '@koalarx/nest/core/errors/no-content.error'

throw new NoContentError('No content available')
// Retorna: 204 No Content
```

## Usar RequestResult (Either Pattern)

A biblioteca usa `RequestResult<Error, Success>` para retornar sucesso ou erro sem exceções:

```typescript
import { failure, ok, RequestResult } from '@koalarx/nest/core/request-overflow/request-result'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'

@Injectable()
export class ReadPersonHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, ReadPersonResponse>
> {
  constructor(
    private readonly repository: IPersonRepository,
    private readonly mapper: AutoMappingService,
  ) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, ReadPersonResponse>> {
    // Buscar no repositório
    const person = await this.repository.read(id)

    // Retornar erro se não encontrar
    if (!person) {
      return failure(new ResourceNotFoundError('Pessoa'))
    }

    // Mapear e retornar sucesso
    return ok(this.mapper.map(person, Person, ReadPersonResponse))
  }
}
```

## No Controller

O controller verifica `isFailure()` e lança o erro se necessário:

```typescript
@Get(':id')
async handle(@Param('id') id: number): Promise<ReadPersonResponse> {
  const response = await this.handler.handle(id)

  // Se falhou, lança a exceção (que é capturada pelos filtros)
  if (response.isFailure()) {
    throw response.value
  }

  // Senão, retorna o sucesso
  return response.value
}
```

## Criar Erro Customizado

```typescript
// src/domain/errors/custom-error.ts
import { HttpStatus } from '@nestjs/common'
import { ErrorBase } from '@koalarx/nest/core/errors/error.base'

export class CustomError extends ErrorBase {
  public statusCode: number = HttpStatus.FORBIDDEN

  constructor(message: string, data?: any) {
    super(message, data)
    this.name = 'CustomError'
  }
}
```

Use o erro customizado:

```typescript
return failure(new CustomError('Custom error message'))
```

E registre no filtro de domínio se necessário (customize o filtro existente).

## Filtros de Exceção

Os filtros são registrados automaticamente pelo `KoalaNestModule`:

### 1. Domain Errors Filter

Captura e trata erros de domínio (ResourceNotFoundError, ConflictError, etc) quando lançados.

**Resposta exemplo:**
```json
{
  "statusCode": 404,
  "message": "Pessoa",
  "data": null
}
```

### 2. Prisma Validation Exception Filter

Captura erros do Prisma e os converte em mensagens legíveis.

**Erros tratados:**
- `P2002`: Duplicação de dados única → 409 Conflict
- `P2003`: Violação de chave estrangeira → 400 Bad Request
- `P2025`: Registro não encontrado → 404 Not Found

**Resposta exemplo:**
```json
{
  "statusCode": 409,
  "message": "Unique constraint failed"
}
```

### 3. Zod Errors Filter

Captura e trata erros de validação Zod no validator.

**Resposta exemplo:**
```json
{
  "statusCode": 400,
  "message": "Dados enviados inválidos",
  "errors": [
    "name is required",
    "email invalid email"
  ]
}
```

### 4. Global Exception Filter

Captura todas as exceções não tratadas.

**Resposta exemplo:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "path": "/users"
}
```

## Exemplo Completo

```typescript
// src/application/user/read/read-user.handler.ts
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@koalarx/nest/core/errors/resource-not-found.error'
import { failure, ok, RequestResult } from '@koalarx/nest/core/request-overflow/request-result'
import { AutoMappingService } from '@koalarx/nest/core/mapping/auto-mapping.service'
import { User } from '@/domain/entities/user/user'
import { IUserRepository } from '@/domain/repositories/iuser.repository'
import { ReadUserResponse } from './read-user.response'

@Injectable()
export class ReadUserHandler extends RequestHandlerBase<
  number,
  RequestResult<ResourceNotFoundError, ReadUserResponse>
> {
  constructor(
    private readonly repository: IUserRepository,
    private readonly mapper: AutoMappingService,
  ) {
    super()
  }

  async handle(
    id: number,
  ): Promise<RequestResult<ResourceNotFoundError, ReadUserResponse>> {
    // Buscar usuário
    const user = await this.repository.read(id)

    // Retornar erro se não encontrar
    if (!user) {
      return failure(new ResourceNotFoundError('Usuário não encontrado'))
    }

    // Mapear e retornar sucesso
    return ok(this.mapper.map(user, User, ReadUserResponse))
  }
}
```

```typescript
// src/host/controllers/user/read-user.controller.ts
@Get(':id')
@ApiResponse({ type: ReadUserResponse })
async handle(@Param('id') id: number): Promise<ReadUserResponse> {
  const response = await this.handler.handle(id)

  // Se falhou, lança exceção (capturada pelos filtros)
  if (response.isFailure()) {
    throw response.value
  }

  return response.value
}
```

## Tratamento de Erros do Validator (Zod)

Erros de validação são automaticamente capturados pelo ZodErrorsFilter:

```typescript
export class CreateUserValidator extends RequestValidatorBase<CreateUserRequest> {
  protected get schema(): ZodType<any, ZodTypeDef, any> {
    return z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required'),
    })
  }
}

// Se dados inválidos, ZodErrorsFilter captura e retorna 400
const validated = new CreateUserValidator(req).validate()
```

## Fluxo de Tratamento de Erros

```
Handler retorna failure(error)
  └─ Controller verifica isFailure()
     └─ throws error
        └─ DomainErrorsFilter captura
           └─ Retorna resposta HTTP com statusCode apropriado
```

Todos os erros são tratados de forma centralizada e segura!
