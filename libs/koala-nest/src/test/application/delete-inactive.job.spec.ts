import { describe, expect, it } from 'bun:test';
import { DeleteInactiveJob } from '@/application/person/jobs/cron/delete-inactive.job';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { Person } from '@/domain/entities/person/person';
import type { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { FakeLoggingService } from '@/test/services/fake-logging.service';
import { FakeRedLockService } from '@/test/services/fake-red-lock.service';

describe('DeleteInactiveJob', () => {
  it('remove todas as páginas de pessoas inativas', async () => {
    const deletedIds: number[] = [];
    const inactivePeople = Array.from({ length: 35 }, (_, index) => {
      const person = new Person();
      person.id = index + 1;
      person.name = `Inactive ${index + 1}`;
      person.active = false;
      return person;
    });

    const repository = {
      findMany: async (query: { page?: number; limit?: number }) => {
        const currentPage = query.page ?? 0;
        const limit = query.limit ?? 30;
        const start = currentPage * limit;
        const items = inactivePeople.slice(start, start + limit);

        return { items, count: inactivePeople.length };
      },
    } as unknown as IPersonRepository;

    const deletePerson = {
      handle: async (id: number) => {
        deletedIds.push(id);
      },
    } as unknown as DeletePersonHandler;

    const job = new DeleteInactiveJob(
      new FakeRedLockService(),
      new FakeLoggingService(),
      repository,
      deletePerson,
    );

    await job['run']();

    expect(deletedIds).toHaveLength(35);
  });
});
