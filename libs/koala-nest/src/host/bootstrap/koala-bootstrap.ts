import { CreatePersonJob } from '@/application/person/jobs/create-person.job';
import { DeleteInactiveJob } from '@/application/person/jobs/delete-inactive.job';
import { InactivePersonHandler } from '@/application/person/events/inactive-person.handler';
import { delay } from '@koalarx/utils/KlDelay';
import { INestApplication } from '@nestjs/common';

type BootstrapOptions = {
  cronJobsEnabled: boolean;
  bootstrapDelayMs: number;
};

export async function bootstrapKoalaJobs(
  app: INestApplication,
  options: BootstrapOptions,
) {
  try {
    const inactivePersonHandler = await app.resolve(InactivePersonHandler);
    inactivePersonHandler.setupSubscriptions();
  } catch {
    // Event jobs não instalados no projeto.
  }

  if (!options.cronJobsEnabled) {
    return;
  }

  if (options.bootstrapDelayMs > 0) {
    await delay(options.bootstrapDelayMs);
  }

  const createPersonJob = await app.resolve(CreatePersonJob);
  const deleteInactiveJob = await app.resolve(DeleteInactiveJob);

  createPersonJob.start();
  deleteInactiveJob.start();
}
