/// <reference types="bun-types/test-globals" />

import { CreatePersonJob } from '@/application/person/jobs/create-person.job';
import { CreatePersonHandler } from '@/application/person/create/create-person.handler';
import { InactivePersonHandler } from '@/application/person/events/inactive-person.handler';
import { EventQueue } from '@/core/background-services/event-service/event-queue';
import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { FakeLoggingService } from '@/test/services/fake-logging.service';
import { FakeRedLockService } from '@/test/services/fake-red-lock.service';
import { afterEach, describe, expect, it, spyOn } from 'bun:test';

describe('CreatePersonJob', () => {
  afterEach(() => {
    EventQueue.clearHandlers();
    EventQueue.clearMarkedAggregates();
  });

  it('cria pessoa e dispara evento de inativação', async () => {
    const person = Person.from({
      id: 10,
      name: 'John Doe',
      active: true,
      address: PersonAddress.from({ id: 1, address: 'Street 1' }),
      contacts: [],
    });

    const createPerson = {
      handle: async () => ({ id: 10 }),
    } as unknown as CreatePersonHandler;

    const repository = {
      findById: async () => person,
      findMany: async () => ({ items: [], count: 0 }),
      save: async () => person,
      delete: async () => undefined,
    } as unknown as IPersonRepository;

    new InactivePersonHandler(repository).setupSubscriptions();

    const dispatchSpy = spyOn(EventQueue, 'dispatchEventsForAggregate');
    const job = new CreatePersonJob(
      new FakeRedLockService(),
      new FakeLoggingService(),
      createPerson,
      repository,
    );

    await job['run']();

    expect(dispatchSpy).toHaveBeenCalled();
    expect(dispatchSpy.mock.calls[0]?.[0]).toEqual(expect.any(String));
  });
});
