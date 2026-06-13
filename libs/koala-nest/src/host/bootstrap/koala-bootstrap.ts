import { delay } from '@koalarx/utils/KlDelay';
import { INestApplication } from '@nestjs/common';

type BootstrapOptions = {
  cronJobsEnabled: boolean;
  bootstrapDelayMs: number;
};

function optionalModulePath(modulePath: string) {
  return modulePath;
}

export async function bootstrapKoalaJobs(
  app: INestApplication,
  options: BootstrapOptions,
) {
  try {
    const { InactivePersonHandler } = await import(
      optionalModulePath('@/application/person/events/inactive-person.handler')
    );
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

  try {
    const { CreatePersonJob } = await import(
      optionalModulePath('@/application/person/jobs/create-person.job')
    );
    const { DeleteInactiveJob } = await import(
      optionalModulePath('@/application/person/jobs/delete-inactive.job')
    );

    const createPersonJob = await app.resolve(CreatePersonJob);
    const deleteInactiveJob = await app.resolve(DeleteInactiveJob);

    createPersonJob.start();
    deleteInactiveJob.start();
  } catch {
    // Cron jobs de exemplo não instalados no projeto.
  }
}
