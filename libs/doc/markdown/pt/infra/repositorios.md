---
title: Repositórios TypeORM
slug: repositorios
category: infra
docKey: infra/repositorios
order: 2
description: Implementação concreta de repositórios estendendo RepositoryBase.
---

# Repositórios TypeORM

Repositórios concretos ficam em `src/infra/repositories` e implementam os contratos abstratos definidos no domínio.

## PersonRepository

```typescript
@Injectable()
export class PersonRepository
  extends RepositoryBase<Person>
  implements IPersonRepository
{
  constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
    super(dataSource, Person);
  }

  findMany(query: PersonQueryDto): Promise<ListResponse<Person>> {
    return this.repository
      .findAndCount({
        where: { name: query.name ? Like(`%${query.name}%`) : undefined },
        order: query.generateOrderBy(),
        skip: query.skip(),
        take: query.limit,
      })
      .then(([items, count]) => ({
        items,
        count,
      }));
  }

  findById(id: number): Promise<Person | null> {
    return this.repository.findOne({ where: { id } });
  }
}
```

## RepositoryBase

Operações comuns (`save`, `delete`) já estão na classe base:

```typescript
export class RepositoryBase<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<T>,
  ) {
    this.repository = this.dataSource.getRepository<T>(entity);
  }

  save(entity: T) {
    return this.repository.save(entity);
  }

  async delete(entity: T) {
    await this.repository.remove(entity);
  }
}
```

Métodos específicos (`findMany`, `findById`, etc.) são implementados na classe concreta.

## Binding no módulo

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
  exports: [DatabaseModule, IPersonRepository],
})
export class RepositoryModule {}
```

## Filtros opcionais

Graças a `invalidWhereValuesBehavior.undefined: 'ignore'` no DataSource, propriedades `undefined` em `where` são ignoradas pelo TypeORM — útil para filtros opcionais como `name`:

```typescript
where: { name: query.name ? Like(`%${query.name}%`) : undefined }
```

## Criar um novo repositório

1. Estenda `RepositoryBase<SuaEntidade>`.
2. Implemente a classe abstrata do domínio.
3. Injete `DATA_SOURCE_PROVIDER_TOKEN` no construtor.
4. Registre o provider no `RepositoryModule`.
