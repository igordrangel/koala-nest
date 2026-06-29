import { Entity as TypeOrmEntity } from 'typeorm';
import { DbContext } from './db-context';

export function Entity(tableName: string) {
  return function (target: Function) {
    TypeOrmEntity(tableName)(target);
    DbContext.entities.add(target);
  };
}
