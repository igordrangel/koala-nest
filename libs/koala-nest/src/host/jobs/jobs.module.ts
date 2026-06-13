import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';
import { JobsBootstrapService } from './jobs-bootstrap.service';
import { CRON_JOBS, EVENT_JOB_HANDLERS } from './jobs.tokens';

type JobsModuleImport =
  | Type<unknown>
  | DynamicModule
  | ForwardReference
  | Promise<DynamicModule>;

export type JobsModuleOptions = {
  imports?: JobsModuleImport[];
  eventHandlers?: Type<unknown>[];
  cronJobs?: Type<unknown>[];
};

@Module({})
export class JobsModule {
  static register(options: JobsModuleOptions = {}): DynamicModule {
    const eventHandlers = options.eventHandlers ?? [];
    const cronJobs = options.cronJobs ?? [];

    return {
      module: JobsModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: EVENT_JOB_HANDLERS,
          useValue: eventHandlers,
        },
        {
          provide: CRON_JOBS,
          useValue: cronJobs,
        },
        ...eventHandlers,
        ...cronJobs,
        JobsBootstrapService,
      ],
    };
  }
}
