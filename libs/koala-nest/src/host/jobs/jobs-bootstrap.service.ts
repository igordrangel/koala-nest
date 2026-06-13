import type { Env } from '@/core/env';
import { delay } from '@koalarx/utils/KlDelay';
import { Inject, Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { CRON_JOBS, EVENT_JOB_HANDLERS } from './jobs.tokens';

type EventJobHandler = {
  setupSubscriptions(): void;
};

type CronJobHandler = {
  start(): Promise<void>;
};

@Injectable()
export class JobsBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(JobsBootstrapService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly config: ConfigService<Env, true>,
    @Inject(EVENT_JOB_HANDLERS)
    private readonly eventHandlers: Type<EventJobHandler>[],
    @Inject(CRON_JOBS)
    private readonly cronJobs: Type<CronJobHandler>[],
  ) {}

  async onModuleInit() {
    for (const handlerType of this.eventHandlers) {
      const handler = this.moduleRef.get(handlerType, { strict: false });
      handler.setupSubscriptions();
    }

    if (this.cronJobs.length === 0) {
      return;
    }

    if (!this.config.get('CRON_JOBS_ENABLED', { infer: true })) {
      this.logger.log(
        'Cron jobs não iniciados (CRON_JOBS_ENABLED=false). Defina true no .env para habilitar.',
      );
      return;
    }

    this.logger.log(`Iniciando ${this.cronJobs.length} cron job(s)...`);

    const bootstrapDelayMs = this.config.get('BOOTSTRAP_DELAY_MS', {
      infer: true,
    });

    if (bootstrapDelayMs > 0) {
      await delay(bootstrapDelayMs);
    }

    for (const jobType of this.cronJobs) {
      const job = this.moduleRef.get(jobType, { strict: false });
      void job.start();
    }
  }
}
