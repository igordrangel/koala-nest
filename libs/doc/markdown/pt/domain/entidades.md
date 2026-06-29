---
title: Entidades
slug: entidades
category: domain
docKey: domain/entidades
order: 1
description: Modelagem de entidades com Entity do core, EntityBase e decorador AutoMap.
---

# Entidades

Entidades representam o modelo de domínio persistido no banco. Elas ficam em `src/domain/entities`, usam o decorador `@Entity` do core (que encapsula o TypeORM) e combinam os demais decoradores TypeORM com `@AutoMap()` para o sistema de mapeamento.

## Decorador @Entity

Use `@Entity` de `@/core/database/entity` — **não** importe `Entity` de `typeorm`. Por baixo dos panos, o decorador aplica o `@Entity` do TypeORM e registra a classe em `DbContext.entities` para o `dataSourceFactory` montar o array automaticamente:

```typescript
// src/core/database/entity.ts
import { Entity as TypeOrmEntity } from 'typeorm';
import { DbContext } from './db-context';

export function Entity(tableName: string) {
  return function (target: Function) {
    TypeOrmEntity(tableName)(target);
    DbContext.entities.add(target);
  };
}
```

Os decoradores de coluna e relacionamento (`Column`, `OneToMany`, `ManyToOne`, etc.) continuam importados de `typeorm`.

## Entidade principal

A entidade `Person` demonstra relacionamentos `OneToOne` e `OneToMany` com cascade:

```typescript
import { EntityBase } from '@/core/base/entity.base';
import { Entity } from '@/core/database/entity';
import { AutoMap } from '@/core/tools/mapping';
import {
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('person')
export class Person extends EntityBase<Person> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  name: string;

  @OneToOne(() => PersonAddress, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @AutoMap()
  address: PersonAddress;

  @OneToMany(() => PersonContact, (contact) => contact.person, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}
```

## Entidade relacionada

```typescript
@Entity('person_address')
export class PersonAddress extends EntityBase<PersonAddress> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  address: string;
}
```

## Entidade PersonContact

Contatos usam `ManyToOne` com referência string para evitar import circular:

```typescript
@Entity('person_contact')
export class PersonContact extends EntityBase<PersonContact> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  contact: string;

  @ManyToOne('Person', 'contacts', {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @AutoMap()
  person: Relation<Person>;
}
```

## AutoMap em coleções

Para propriedades que são arrays de outra entidade ou classe, informe o tipo explicitamente:

```typescript
@AutoMap({ type: () => PersonContact })
contacts: PersonContact[];
```

Isso permite ao `AutoMapper` resolver o tipo de destino ao mapear cada item da coleção.

## Registro no DataSource

O `dataSourceFactory` lê as entidades registradas automaticamente pelo decorador `@Entity`:

```typescript
import { DbContext } from '@/core/database/db-context';

const dataSource = new DataSource({
  type: 'postgres',
  url: env.get('DATABASE_URL'),
  schema: env.get('DATABASE_SCHEMA'),
  entities: Array.from(DbContext.entities.values()),
  invalidWhereValuesBehavior: {
    undefined: 'ignore',
  },
});
```

Ao decorar uma nova entidade com `@Entity`, ela já entra no DataSource em runtime — não é necessário alterar o `dataSourceFactory` manualmente.

A opção `invalidWhereValuesBehavior.undefined: 'ignore'` evita que filtros opcionais (`undefined`) gerem cláusulas inválidas no TypeORM.

## Carregar relacionamentos no repositório

Evite `eager: true` nas entidades — carregue relations **explicitamente** no repositório conforme o caso de uso:

- **`findById`** — detalhe com `relations: { address: true, contacts: true }`
- **`findMany`** — listagem leve, sem `relations` (arrays podem ser normalizados como `[]` pelo `RepositoryBase`)

```typescript
findById(id: number): Promise<Person | null> {
  return this.findOneNormalized({
    where: { id },
    relations: { address: true, contacts: true },
  });
}

findMany(query: PersonQueryDto): Promise<ListResponse<Person>> {
  return this.repository.findAndCount({ /* sem relations */ })
    .then(([items, count]) => ({
      items: this.normalizeEntities(items),
      count,
    }));
}
```

## Boas práticas

- Mantenha entidades livres de lógica HTTP (sem `@ApiProperty`).
- Use `cascade` e `onDelete` conforme a regra de negócio do agregado.
- Coleções persistidas são **estado completo** no `save` — substitua a lista no update; itens ausentes viram órfãos com `orphanedRowAction: 'delete'`.
- Use `@Entity` de `@/core/database/entity` e gere migrations após alterações de schema.
