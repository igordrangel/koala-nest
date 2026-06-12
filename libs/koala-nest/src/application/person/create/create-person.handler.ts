import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { CreatePersonRequest } from './create-person.request';
import { CreatePersonResponse } from './create-person.response';
import { Injectable } from '@nestjs/common';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { AutoMapper } from '@/core/tools/mapping';
import { Person } from '@/domain/entities/person/person';
import { CreatePersonValidator } from './create-person.validator';

@Injectable()
export class CreatePersonHandler extends RequestHandlerBase<
  CreatePersonRequest,
  CreatePersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: CreatePersonRequest): Promise<CreatePersonResponse> {
    const person = AutoMapper.map(
      new CreatePersonValidator(req).validate(),
      CreatePersonRequest,
      Person,
    );
    const createdPerson = await this.repository.save(person);
    return AutoMapper.map(createdPerson, Person, CreatePersonResponse);
  }
}
