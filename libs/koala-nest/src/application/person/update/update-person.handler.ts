import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { PersonContact } from '@/domain/entities/person/person-contact';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatePersonRequest } from './update-person.request';
import { UpdatePersonValidator } from './update-person.validator';
import { ICacheService } from '@/domain/common/icache.service';
import { invalidatePersonListCache } from '@/core/utils/person-list-cache';

@Injectable()
export class UpdatePersonHandler implements RequestHandlerBase<
  UpdatePersonRequest,
  void
> {
  constructor(
    private readonly repository: IPersonRepository,
    private readonly cache: ICacheService,
  ) {}

  async handle(request: UpdatePersonRequest): Promise<void> {
    const validated = new UpdatePersonValidator(request).validate();
    const person = await this.repository.findById(validated.id);

    if (!person) {
      throw new NotFoundException('Pessoa não encontrada');
    }

    person.name = validated.name;
    person.address.address = validated.address.address;

    person.contacts = validated.contacts.map((contactRequest) => {
      if (contactRequest.id) {
        const existing = person.contacts.find(
          (contact) => contact.id === contactRequest.id,
        );

        if (existing) {
          existing.contact = contactRequest.contact;
          return existing;
        }
      }

      const contact = new PersonContact();
      contact.contact = contactRequest.contact;
      contact.person = person;
      return contact;
    });

    await this.repository.save(person);
    await invalidatePersonListCache(this.cache);
  }
}
