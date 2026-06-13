import { DeleteInactiveJob } from '@/application/person/jobs/cron/delete-inactive.job';
import { DeletePersonHandler } from '@/application/person/delete/delete-person.handler';
import { ReadManyPersonHandler } from '@/application/person/read-many/read-many-person.handler';
import { FakeLoggingService } from '@/test/services/fake-logging.service';
import { FakeRedLockService } from '@/test/services/fake-red-lock.service';

describe('DeleteInactiveJob', () => {
  it('remove pessoas inativas retornadas pela listagem', async () => {
    const deletedIds: number[] = [];

    const readManyPerson = {
      handle: async () => ({
        items: [{ id: 1, name: 'Inactive', active: false }],
        count: 1,
      }),
    } as unknown as ReadManyPersonHandler;

    const deletePerson = {
      handle: async (id: number) => {
        deletedIds.push(id);
      },
    } as unknown as DeletePersonHandler;

    const job = new DeleteInactiveJob(
      new FakeRedLockService(),
      new FakeLoggingService(),
      readManyPerson,
      deletePerson,
    );

    await job['run']();

    expect(deletedIds).toEqual([1]);
  });
});
