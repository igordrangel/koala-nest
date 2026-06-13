import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { findPersonOrThrow } from '@/application/person/find-person-or-throw';
import { AutoMapper } from '@/core/tools/mapping';
import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable } from '@nestjs/common';
import { ReadPersonResponse } from './read-person.response';

@Injectable()
export class ReadPersonHandler extends RequestHandlerBase<
  number,
  ReadPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(id: number): Promise<ReadPersonResponse> {
    const person = await findPersonOrThrow(this.repository, id);
    return AutoMapper.map(person, Person, ReadPersonResponse);
  }
}
