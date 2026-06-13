import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { EventHandlerBase } from '@/core/background-services/event-service/event-handler.base';
import { Injectable } from '@nestjs/common';
import { InactivePersonEvent } from './inactive-person.event';

@Injectable()
export class InactivePersonHandler extends EventHandlerBase {
  constructor(private readonly repository: IPersonRepository) {
    super(InactivePersonEvent);
  }

  async handleEvent(_event: InactivePersonEvent): Promise<void> {
    const query = Object.assign(new PersonQueryDto(), {
      active: true,
      limit: 1000,
      page: 0,
    });
    const { items } = await this.repository.findMany(query);

    for (const person of items) {
      person.active = false;
      await this.repository.save(person);
    }
  }
}
