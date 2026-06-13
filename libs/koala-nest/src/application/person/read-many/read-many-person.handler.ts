import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { buildListCacheKey } from '@/core/utils/build-list-cache-key';
import { PERSON_LIST_CACHE_PREFIX } from '@/core/utils/person-list-cache';
import { ICacheService } from '@/domain/common/icache.service';
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

const PERSON_LIST_CACHE_TTL_SECONDS = 120;

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(
    private readonly repository: IPersonRepository,
    private readonly cache: ICacheService,
  ) {
    super();
  }

  async handle(req: ReadManyPersonRequest): Promise<ReadManyPersonResponse> {
    const query = AutoMapper.map(
      new ReadManyPersonValidator(req).validate(),
      ReadManyPersonRequest,
      PersonQueryDto,
    );

    const cacheKey = buildListCacheKey(PERSON_LIST_CACHE_PREFIX, query);
    const cached = await this.cache.get(cacheKey);

    if (cached) {
      return ReadManyPersonResponse.from(JSON.parse(cached));
    }

    const response = ReadManyPersonResponse.from(
      await this.repository.findMany(query).then((result) => ({
        items: result.items.map((item) =>
          AutoMapper.map(item, Person, ReadManyPersonResponseItem),
        ),
        count: result.count,
      })),
    );

    await this.cache.set(
      cacheKey,
      JSON.stringify(response),
      PERSON_LIST_CACHE_TTL_SECONDS,
    );

    return response;
  }
}
