import { RepositoryBase } from '@/infra/repositories/repository.base';
import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE_PROVIDER_TOKEN } from '@/infra/database/data-source-factory';
import { DataSource, FindOptionsWhere, Like } from 'typeorm';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { ListResponse } from '@/core/types';

@Injectable()
export class PersonRepository
  extends RepositoryBase<Person>
  implements IPersonRepository
{
  constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
    super(dataSource, Person);
  }

  findMany(query: PersonQueryDto): Promise<ListResponse<Person>> {
    const where: FindOptionsWhere<Person> = {};

    if (query.name) {
      where.name = Like<string>(`%${query.name}%`);
    }

    if (query.active !== undefined) {
      where.active = query.active;
    }

    return this.repository
      .findAndCount({
        where,
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
    return this.repository.findOne({
      where: { id },
      relations: { address: true, contacts: true },
    });
  }
}
