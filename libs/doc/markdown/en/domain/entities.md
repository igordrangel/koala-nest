---
title: Entities
slug: entities
category: domain
docKey: domain/entidades
order: 1
description: Entity modeling with core Entity decorator, EntityBase, and AutoMap.
---

# Entities

Entities represent the domain model persisted in the database. They live in `src/domain/entities`, use the core `@Entity` decorator (which wraps TypeORM), and combine other TypeORM decorators with `@AutoMap()` for the mapping system.

## @Entity decorator

Use `@Entity` from `@/core/database/entity` — **do not** import `Entity` from `typeorm`. Under the hood, the decorator applies TypeORM's `@Entity` and registers the class in `DbContext.entities` so `dataSourceFactory` can build the array automatically:

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

Column and relationship decorators (`Column`, `OneToMany`, `ManyToOne`, etc.) are still imported from `typeorm`.

## Main entity

The `Person` entity demonstrates `OneToOne` and `OneToMany` relationships with cascade:

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

## Related entity

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

## PersonContact entity

Contacts use `ManyToOne` with a string reference to avoid circular imports:

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

## AutoMap on collections

For properties that are arrays of another entity or class, specify the type explicitly:

```typescript
@AutoMap({ type: () => PersonContact })
contacts: PersonContact[];
```

This allows `AutoMapper` to resolve the target type when mapping each item in the collection.

## DataSource registration

`dataSourceFactory` reads entities registered automatically by the `@Entity` decorator:

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

When you decorate a new entity with `@Entity`, it is already included in the runtime DataSource — no manual change to `dataSourceFactory` is required.

The `invalidWhereValuesBehavior.undefined: 'ignore'` option prevents optional filters (`undefined`) from generating invalid clauses in TypeORM.

## Loading relations in the repository

Avoid `eager: true` on entities — load relations **explicitly** in the repository per use case:

- **`findById`** — detail with `relations: { address: true, contacts: true }`
- **`findMany`** — lightweight listing without `relations` (arrays may be normalized to `[]` by `RepositoryBase`)

```typescript
findById(id: number): Promise<Person | null> {
  return this.findOneNormalized({
    where: { id },
    relations: { address: true, contacts: true },
  });
}

findMany(query: PersonQueryDto): Promise<ListResponse<Person>> {
  return this.repository.findAndCount({ /* no relations */ })
    .then(([items, count]) => ({
      items: this.normalizeEntities(items),
      count,
    }));
}
```

## Best practices

- Keep entities free of HTTP logic (no `@ApiProperty`).
- Use `cascade` and `onDelete` according to the aggregate's business rules.
- Persisted collections are **full state** on `save` — replace the list on update; missing items become orphans with `orphanedRowAction: 'delete'`.
- Use `@Entity` from `@/core/database/entity` and generate migrations after schema changes.
