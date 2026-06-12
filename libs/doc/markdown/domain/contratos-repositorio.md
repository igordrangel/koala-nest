---
title: Contratos de repositório
slug: contratos-repositorio
category: domain
order: 2
description: Classes abstratas de repositório e DTOs de consulta no domínio.
---

# Contratos de repositório

A camada de domínio define **o que** o repositório deve fazer, sem expor **como** os dados são persistidos. Handlers dependem desses contratos; a infraestrutura fornece implementações concretas.

## Classe abstrata

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

## DTO de consulta

DTOs de query ficam em `src/domain/dtos` e estendem `PaginationDto` quando aplicável:

```typescript
export class PersonQueryDto extends PaginationDto {
  @AutoMap()
  name?: string;
}
```

O handler mapeia o request validado para o DTO antes de chamar o repositório:

```typescript
const query = AutoMapper.map(
  new ReadManyPersonValidator(req).validate(),
  ReadManyPersonRequest,
  PersonQueryDto,
);
```

## Injeção no handler

Handlers recebem a classe abstrata via construtor:

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

## Binding no módulo de infraestrutura

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
  exports: [DatabaseModule, IPersonRepository],
})
export class RepositoryModule {}
```

## Criar um novo repositório

1. Defina a classe abstrata em `src/domain/repositories/i<recurso>.repository.ts`.
2. Crie o DTO de consulta em `src/domain/dtos/` se houver listagens filtradas.
3. Implemente a classe concreta em `src/infra/repositories/`.
4. Registre o provider no `RepositoryModule`.
