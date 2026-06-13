---
title: Repository contracts
slug: contratos-repositorio
category: domain
order: 2
description: Abstract repository classes and query DTOs in the domain.
---

# Repository contracts

The domain layer defines **what** the repository should do, without exposing **how** data is persisted. Handlers depend on these contracts; infrastructure provides concrete implementations.

## Abstract class

```typescript
// src/domain/repositories/iperson.repository.ts
import { ListResponse } from '@/core/types';
import { PersonQueryDto } from '../dtos/person-query.dto';
import { Person } from '../entities/person/person';

export abstract class IPersonRepository {
  abstract findMany(query: PersonQueryDto): Promise<ListResponse<Person>>;
  abstract findById(id: number): Promise<Person | null>;
  abstract save(person: Person): Promise<Person>;
  abstract delete(person: Person): Promise<void>;
}
```

## Query DTO

Query DTOs live in `src/domain/dtos` and extend `PaginationDto` when applicable:

```typescript
export class PersonQueryDto extends PaginationDto {
  @AutoMap()
  name?: string;
}
```

The handler maps the validated request to the DTO before calling the repository:

```typescript
const query = AutoMapper.map(
  new ReadManyPersonValidator(req).validate(),
  ReadManyPersonRequest,
  PersonQueryDto,
);
```

## Injection in the handler

Handlers receive the abstract class via constructor:

```typescript
@Injectable()
export class DeletePersonHandler implements RequestHandlerBase<number, void> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(id: number): Promise<void> {
    const person = await this.repository.findById(id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    await this.repository.delete(person);
  }
}
```

## Binding in the infrastructure module

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
  exports: [DatabaseModule, IPersonRepository],
})
export class RepositoryModule {}
```

## Creating a new repository

1. Define the abstract class in `src/domain/repositories/i<resource>.repository.ts`.
2. Create the query DTO in `src/domain/dtos/` if there are filtered listings.
3. Implement the concrete class in `src/infra/repositories/`.
4. Register the provider in `RepositoryModule`.
