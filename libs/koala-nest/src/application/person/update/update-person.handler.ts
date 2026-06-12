import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable } from '@nestjs/common';
import { UpdatePersonRequest } from './update-person.request';
import { UpdatePersonValidator } from './update-person.validator';

@Injectable()
export class UpdatePersonHandler implements RequestHandlerBase<
  UpdatePersonRequest,
  void
> {
  constructor(private readonly repository: IPersonRepository) {}

  async handle(request: UpdatePersonRequest): Promise<void> {
    const person = AutoMapper.map(
      new UpdatePersonValidator(request).validate(),
      UpdatePersonRequest,
      Person,
    );

    await this.repository.save(person);
  }
}
