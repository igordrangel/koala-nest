---
title: TypeORM repositories
slug: repositorios
category: infra
order: 2
description: Concrete repository implementation extending RepositoryBase.
---

# TypeORM repositories

Concrete repositories live in `src/infra/repositories` and implement the abstract contracts defined in the domain.

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

Common operations (`save`, `delete`) are already in the base class:

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

Specific methods (`findMany`, `findById`, etc.) are implemented in the concrete class.

## Module binding

```typescript
@Module({
  imports: [DatabaseModule],
  providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
  exports: [DatabaseModule, IPersonRepository],
})
export class RepositoryModule {}
```

## Optional filters

Thanks to `invalidWhereValuesBehavior.undefined: 'ignore'` on the DataSource, `undefined` properties in `where` are ignored by TypeORM — useful for optional filters like `name`:

```typescript
where: { name: query.name ? Like(`%${query.name}%`) : undefined }
```

## Creating a new repository

1. Extend `RepositoryBase<YourEntity>`.
2. Implement the domain abstract class.
3. Inject `DATA_SOURCE_PROVIDER_TOKEN` in the constructor.
4. Register the provider in `RepositoryModule`.
