---
title: Entidades
slug: entidades
category: domain
docKey: domain/entidades
order: 1
description: Modelagem de entidades TypeORM com EntityBase e decorador AutoMap.
---

# Entidades

Entidades representam o modelo de domínio persistido no banco. Elas ficam em `src/domain/entities` e usam decoradores TypeORM combinados com `@AutoMap()` para o sistema de mapeamento.

## Entidade principal

A entidade `Person` demonstra relacionamentos `OneToOne` e `OneToMany` com cascade:

```typescript
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

Todas as entidades devem ser listadas no factory do DataSource:

```typescript
const dataSource = new DataSource({
  type: 'postgres',
  url: env.get('DATABASE_URL'),
  entities: [Person, PersonAddress, PersonContact],
  invalidWhereValuesBehavior: {
    undefined: 'ignore',
  },
});
```

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
- Registre novas entidades no `dataSourceFactory` e gere migrations após alterações.
