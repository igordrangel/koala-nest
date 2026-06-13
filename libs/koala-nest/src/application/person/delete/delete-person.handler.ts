import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { findPersonOrThrow } from '@/application/person/find-person-or-throw';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable } from '@nestjs/common';
import { ICacheService } from '@/domain/common/icache.service';
import { invalidatePersonListCache } from '@/core/utils/person-list-cache';

@Injectable()
export class DeletePersonHandler extends RequestHandlerBase<number, void> {
  constructor(
    private readonly repository: IPersonRepository,
    private readonly cache: ICacheService,
  ) {
    super();
  }

  async handle(id: number): Promise<void> {
    const person = await findPersonOrThrow(this.repository, id);
    await this.repository.delete(person);
    await invalidatePersonListCache(this.cache);
  }
}
