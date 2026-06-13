import { RepositoryBase } from '@/infra/repositories/repository.base';
import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Inject, Injectable } from '@nestjs/common';
import { DATA_SOURCE_PROVIDER_TOKEN } from '../database/data-source-factory';
import { DataSource, Like } from 'typeorm';
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
    return this.repository.findOne({
      where: { id },
      relations: ['address', 'contacts'],
    });
  }
}
