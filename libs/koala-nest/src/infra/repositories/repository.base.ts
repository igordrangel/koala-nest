import { initializeUndefinedArrayProps } from '@/core/utils/initialize-undefined-array-props';
import type { Type } from '@nestjs/common';
import {
  DataSource,
  EntityTarget,
  FindManyOptions,
  FindOneOptions,
  ObjectLiteral,
  Repository,
} from 'typeorm';

function getLoadedRelationKeys(
  relations?: FindOneOptions<ObjectLiteral>['relations'],
): string[] {
  if (!relations) {
    return [];
  }

  if (Array.isArray(relations)) {
    return relations.map(String);
  }

  return Object.keys(relations);
}

export class RepositoryBase<T extends ObjectLiteral> {
  protected readonly repository: Repository<T>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<T>,
  ) {
    this.repository = this.dataSource.getRepository<T>(entity);
  }

  protected normalizeEntity<E extends ObjectLiteral>(
    entity: E,
    loadedRelationKeys: string[] = [],
  ): E {
    if (loadedRelationKeys.length > 0) {
      initializeUndefinedArrayProps(
        entity as Record<string, unknown>,
        this.getEntityType(),
        loadedRelationKeys,
      );
    }

    return entity;
  }

  protected normalizeEntities<E extends ObjectLiteral>(
    entities: E[],
    loadedRelationKeys: string[] = [],
  ): E[] {
    return entities.map((entity) =>
      this.normalizeEntity(entity, loadedRelationKeys),
    );
  }

  protected getEntityType(): Type<unknown> {
    return this.entity as Type<unknown>;
  }

  protected findOneNormalized(options: FindOneOptions<T>) {
    const loadedRelationKeys = getLoadedRelationKeys(options.relations);

    return this.repository
      .findOne(options)
      .then((entity) =>
        entity ? this.normalizeEntity(entity, loadedRelationKeys) : null,
      );
  }

  protected findNormalized(options: FindManyOptions<T>) {
    const loadedRelationKeys = getLoadedRelationKeys(options.relations);

    return this.repository
      .find(options)
      .then((entities) => this.normalizeEntities(entities, loadedRelationKeys));
  }

  save(entity: T) {
    return this.repository.save(entity);
  }

  async delete(entity: T) {
    await this.repository.remove(entity);
  }
}
