import { CanActivate, INestApplication, Type } from '@nestjs/common';
import { CronJobHandlerBase } from './background-services/cron-service/cron-job.handler.base';
import { EventHandlerBase } from './background-services/event-service/event-handler.base';
import { delay } from './utils/delay';

type CronJobClass = Type<CronJobHandlerBase>;
type EventJobClass = Type<EventHandlerBase>;
type GuardClass = Type<CanActivate>;

export class KoalaApp {
  private readonly cronJobs: CronJobClass[] = [];
  private readonly eventJobs: EventJobClass[] = [];
  private readonly globalGuards: GuardClass[] = [];

  constructor(private readonly app: INestApplication) {}

  addCronJob(job: CronJobClass) {
    this.cronJobs.push(job);
    return this;
  }

  addEventJob(eventJob: EventJobClass) {
    this.eventJobs.push(eventJob);
    return this;
  }

  addGlobalGuard(Guard: GuardClass) {
    this.globalGuards.push(Guard);
    return this;
  }

  async startJobs() {
    await delay(5000);

    const cronJobInstances = await Promise.all(
      this.cronJobs.map((job) => this.app.resolve(job)),
    );

    for (const cronJob of cronJobInstances) {
      void cronJob.start();
    }

    const eventJobInstances = await Promise.all(
      this.eventJobs.map((job) => this.app.resolve(job)),
    );

    for (const eventJob of eventJobInstances) {
      eventJob.setupSubscriptions();
    }
  }

  async registerGlobalGuards() {
    const guards = await Promise.all(
      this.globalGuards.map((Guard) => this.app.resolve(Guard)),
    );

    for (const guard of guards) {
      this.app.useGlobalGuards(guard);
    }
  }

  async build() {
    await this.registerGlobalGuards();
    void this.startJobs();
    return this.app;
  }
}
