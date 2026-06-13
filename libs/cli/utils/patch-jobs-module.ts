import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { removeImportLines } from './project-files';
import { resolveProjectPath } from './resolve-project-path';

export type JobsRegistration = {
  eventHandlers: string[];
  cronJobs: string[];
};

const EXAMPLE_JOB_IMPORTS = {
  InactivePersonHandler:
    '@/application/person/jobs/events/person/inactive-person/inactive-person.handler',
  CreatePersonJob: '@/application/person/jobs/cron/create-person.job',
  DeleteInactiveJob: '@/application/person/jobs/cron/delete-inactive.job',
} as const;

const PERSON_MODULE_IMPORT =
  "import { PersonModule } from './controllers/person/person.module';";

function appModulePath(projectName: string) {
  return path.join(resolveProjectPath(projectName), 'src/host/app.module.ts');
}

function hasPersonModule(projectName: string) {
  return existsSync(
    path.join(
      resolveProjectPath(projectName),
      'src/host/controllers/person/person.module.ts',
    ),
  );
}

function hasExampleHandlers(options: JobsRegistration) {
  return options.eventHandlers.length > 0 || options.cronJobs.length > 0;
}

export function buildJobsRegisterBlock(options: JobsRegistration): string {
  const eventHandlers =
    options.eventHandlers.length > 0
      ? `[${options.eventHandlers.join(', ')}]`
      : '[]';
  const cronJobs =
    options.cronJobs.length > 0 ? `[${options.cronJobs.join(', ')}]` : '[]';
  const imports = hasExampleHandlers(options)
    ? 'imports: [PersonModule],\n      '
    : '';

  return `JobsModule.register({
      ${imports}eventHandlers: ${eventHandlers},
      cronJobs: ${cronJobs},
    })`;
}

export function ensureJobsModuleImport(content: string) {
  if (/from ['"]\.\/jobs\/jobs\.module/.test(content)) {
    return content;
  }

  return content.replace(
    "import { Module } from '@nestjs/common';",
    "import { Module } from '@nestjs/common';\nimport { JobsModule } from './jobs/jobs.module';",
  );
}

function ensurePersonModuleImport(content: string) {
  if (/from ['"]\.\/controllers\/person\/person\.module/.test(content)) {
    return content;
  }

  const jobsImportPattern =
    /import \{ JobsModule \} from ['"]\.\/jobs\/jobs\.module(?:\.js)?['"];/;

  if (jobsImportPattern.test(content)) {
    return content.replace(
      jobsImportPattern,
      (match) => `${match}\n${PERSON_MODULE_IMPORT}`,
    );
  }

  return content.replace(
    "import { Module } from '@nestjs/common';",
    `import { Module } from '@nestjs/common';\n${PERSON_MODULE_IMPORT}`,
  );
}

function hasPersonModuleInAppImports(content: string) {
  return /\n {4}PersonModule,\n/.test(content);
}

function ensurePersonModuleInAppImports(content: string) {
  if (hasPersonModuleInAppImports(content)) {
    return content;
  }

  return content.replace(
    /(JobsModule\.register\(\{[\s\S]*?\}\),)/,
    '$1\n    PersonModule,',
  );
}

function removePersonModuleFromAppImports(content: string) {
  return content.replace(/\n {4}PersonModule,\n/g, '\n');
}

export function patchAppModuleJobs(
  projectName: string,
  options: JobsRegistration,
) {
  let content = readFileSync(appModulePath(projectName), 'utf8');

  content = removeImportLines(content, Object.values(EXAMPLE_JOB_IMPORTS));
  content = ensureJobsModuleImport(content);

  const exampleHandlers = hasExampleHandlers(options);
  const crudWithPerson = hasPersonModule(projectName);

  if (exampleHandlers) {
    content = ensurePersonModuleImport(content);
    content = removePersonModuleFromAppImports(content);
  } else if (crudWithPerson) {
    content = ensurePersonModuleImport(content);
    content = ensurePersonModuleInAppImports(content);
  } else {
    content = removePersonModuleFromAppImports(content);
  }

  const importLines = [...options.eventHandlers, ...options.cronJobs]
    .map((symbol) => {
      const specifier =
        EXAMPLE_JOB_IMPORTS[symbol as keyof typeof EXAMPLE_JOB_IMPORTS];

      return specifier ? `import { ${symbol} } from '${specifier}';` : '';
    })
    .filter(Boolean)
    .join('\n');

  if (importLines) {
    const jobsImportPattern =
      /import \{ JobsModule \} from ['"]\.\/jobs\/jobs\.module(?:\.js)?['"];/;

    if (jobsImportPattern.test(content)) {
      content = content.replace(
        jobsImportPattern,
        (match) => `${match}\n${importLines}`,
      );
    }
  }

  if (content.includes('JobsModule.register(')) {
    content = content.replace(
      /JobsModule\.register\(\{[\s\S]*?\}\)/,
      buildJobsRegisterBlock(options),
    );
  } else {
    content = content.replace(
      'ConfigModule.forRoot({',
      `${buildJobsRegisterBlock(options)},\n    ConfigModule.forRoot({`,
    );
  }

  writeFileSync(appModulePath(projectName), content, 'utf8');
}

export function patchAppModuleExampleJobs(
  projectName: string,
  options: { eventJobs: boolean; cronJobs: boolean },
) {
  patchAppModuleJobs(projectName, {
    eventHandlers: options.eventJobs ? ['InactivePersonHandler'] : [],
    cronJobs: options.cronJobs ? ['CreatePersonJob', 'DeleteInactiveJob'] : [],
  });
}
