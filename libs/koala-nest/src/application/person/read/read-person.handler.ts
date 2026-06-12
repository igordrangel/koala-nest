import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadPersonResponse } from './read-person.response';

@Injectable()
export class ReadPersonHandler implements RequestHandlerBase<
  number,
  ReadPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(id: number): Promise<ReadPersonResponse> {
    const person = await this.repository.findById(id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    return AutoMapper.map(person, Person, ReadPersonResponse);
  }
}
