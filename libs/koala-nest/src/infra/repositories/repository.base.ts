import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';

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
