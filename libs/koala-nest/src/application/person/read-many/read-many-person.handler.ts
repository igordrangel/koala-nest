import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable } from '@nestjs/common';
import { ReadManyPersonRequest } from './read-many-person.request';
import {
  ReadManyPersonResponse,
  ReadManyPersonResponseItem,
} from './read-many-person.response';
import { ReadManyPersonValidator } from './read-many-person.validator';
import { Person } from '@/domain/entities/person/person';

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: ReadManyPersonRequest): Promise<ReadManyPersonResponse> {
    const query = AutoMapper.map(
      new ReadManyPersonValidator(req).validate(),
      ReadManyPersonRequest,
      PersonQueryDto,
    );

    return ReadManyPersonResponse.from(
      await this.repository.findMany(query).then((result) => ({
        items: result.items.map((item) =>
          AutoMapper.map(item, Person, ReadManyPersonResponseItem),
        ),
        count: result.count,
      })),
    );
  }
}
