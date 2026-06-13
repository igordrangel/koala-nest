import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { getSourceCodePath } from './get-source-code-path';
import { patchAppModuleExampleJobs } from './patch-jobs-module';
import { resolveProjectPath } from './resolve-project-path';

function projectFile(projectName: string, relativePath: string) {
  return path.join(resolveProjectPath(projectName), relativePath);
}

function hasPersonModule(projectName: string) {
  return existsSync(
    projectFile(projectName, 'src/host/controllers/person/person.module.ts'),
  );
}

export function copyFromTemplate(relativePath: string, projectName = '') {
  const sourcePath = path.join(getSourceCodePath(), relativePath);
  const targetPath = projectFile(projectName, relativePath);

  mkdirSync(path.dirname(targetPath), { recursive: true });
  cpSync(sourcePath, targetPath, { recursive: true, force: true });
}

export async function restorePersonCacheFeatures(projectName: string) {
  if (!hasPersonModule(projectName)) {
    return;
  }

  const files = [
    'src/application/person/create/create-person.handler.ts',
    'src/application/person/update/update-person.handler.ts',
    'src/application/person/delete/delete-person.handler.ts',
    'src/application/person/read-many/read-many-person.handler.ts',
    'src/application/person/jobs/events/person/inactive-person/inactive-person.handler.ts',
    'src/core/utils/person-list-cache.ts',
    'src/core/utils/build-list-cache-key.ts',
  ];

  for (const file of files) {
    copyFromTemplate(file, projectName);
  }
}

export async function restorePersonCronJobs(projectName: string) {
  if (!hasPersonModule(projectName)) {
    return;
  }

  copyFromTemplate('src/application/person/jobs/cron', projectName);

  patchAppModuleExampleJobs(projectName, {
    eventJobs: existsSync(
      projectFile(
        projectName,
        'src/application/person/jobs/events/person/inactive-person/inactive-person.handler.ts',
      ),
    ),
    cronJobs: true,
  });
}

export async function restorePersonEventJobs(projectName: string) {
  if (!hasPersonModule(projectName)) {
    return;
  }

  copyFromTemplate('src/application/person/jobs/events', projectName);

  patchAppModuleExampleJobs(projectName, {
    eventJobs: true,
    cronJobs: existsSync(
      projectFile(
        projectName,
        'src/application/person/jobs/cron/create-person.job.ts',
      ),
    ),
  });
}

export async function restorePersonAuthExample(projectName: string) {
  if (!hasPersonModule(projectName)) {
    return;
  }

  copyFromTemplate(
    'src/host/controllers/person/delete-person.controller.ts',
    projectName,
  );
}

export async function upgradeCacheToRedis(projectName: string) {
  copyFromTemplate('src/infra/common/redis-cache.service.ts', projectName);
  copyFromTemplate('src/infra/common/cache-service.provider.ts', projectName);
}
