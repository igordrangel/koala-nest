import { readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { removeImportLines } from './project-files';
import { patchAppModuleExampleJobs } from './patch-jobs-module';
import { resolveProjectPath } from './resolve-project-path';

function projectFile(projectName: string, relativePath: string) {
  return path.join(resolveProjectPath(projectName), relativePath);
}

function readProjectFile(projectName: string, relativePath: string) {
  return readFileSync(projectFile(projectName, relativePath), 'utf8');
}

function writeProjectFile(
  projectName: string,
  relativePath: string,
  content: string,
) {
  writeFileSync(projectFile(projectName, relativePath), content);
}

const READ_MANY_WITHOUT_CACHE = `import { RequestHandlerBase } from '@/application/common/request-handler.base';
import { AutoMapper } from '@/core/tools/mapping';
import { PersonQueryDto } from '@/domain/dtos/person-query.dto';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Injectable } from '@nestjs/common';
import { ReadManyPersonRequest } from './read-many-person.request';
import {
  ReadManyPersonResponse,
  ReadManyPersonResponseItem,
} from './read-many-person.response';
import { ReadManyPersonValidator } from './read-many-person.validator';
import { Person } from '@/domain/entities/person/person';

@Injectable()
export class ReadManyPersonHandler extends RequestHandlerBase<
  ReadManyPersonRequest,
  ReadManyPersonResponse
> {
  constructor(private readonly repository: IPersonRepository) {
    super();
  }

  async handle(req: ReadManyPersonRequest): Promise<ReadManyPersonResponse> {
    const query = AutoMapper.map(
      new ReadManyPersonValidator(req).validate(),
      ReadManyPersonRequest,
      PersonQueryDto,
    );

    return ReadManyPersonResponse.from(
      await this.repository.findMany(query).then((result) => ({
        items: result.items.map((item) =>
          AutoMapper.map(item, Person, ReadManyPersonResponseItem),
        ),
        count: result.count,
      })),
    );
  }
}
`;

export function stripPersonModuleCacheUsage(projectName: string) {
  const handlers = [
    'src/application/person/create/create-person.handler.ts',
    'src/application/person/update/update-person.handler.ts',
    'src/application/person/delete/delete-person.handler.ts',
    'src/application/person/jobs/events/person/inactive-person/inactive-person.handler.ts',
  ];

  for (const handlerPath of handlers) {
    let content = readProjectFile(projectName, handlerPath);
    content = removeImportLines(content, [
      '@/domain/common/icache.service',
      '@/core/utils/person-list-cache',
    ]);
    content = content.replace(
      /,\n {4}private readonly cache: ICacheService/,
      '',
    );
    content = content.replace(
      /\n {4}await invalidatePersonListCache\(this\.cache\);\n/,
      '\n',
    );
    writeProjectFile(projectName, handlerPath, content);
  }

  writeProjectFile(
    projectName,
    'src/application/person/read-many/read-many-person.handler.ts',
    READ_MANY_WITHOUT_CACHE,
  );

  for (const cacheUtil of [
    'src/core/utils/person-list-cache.ts',
    'src/core/utils/build-list-cache-key.ts',
  ]) {
    rmSync(projectFile(projectName, cacheUtil), { force: true });
  }
}

export function stripPersonModuleCronJobs(projectName: string) {
  rmSync(projectFile(projectName, 'src/application/person/jobs/cron'), {
    recursive: true,
    force: true,
  });
}

export function stripPersonModuleEventJobs(projectName: string) {
  rmSync(projectFile(projectName, 'src/application/person/jobs/events'), {
    recursive: true,
    force: true,
  });
}

export function adjustCrudPersonModule(
  projectName: string,
  options: {
    cache: boolean;
    cronJobs: boolean;
    eventJobs: boolean;
    auth: boolean;
  },
) {
  if (!options.cache) {
    stripPersonModuleCacheUsage(projectName);
  }

  if (!options.cronJobs) {
    stripPersonModuleCronJobs(projectName);
  }

  if (!options.eventJobs) {
    stripPersonModuleEventJobs(projectName);
  }

  if (!options.auth) {
    stripPersonAuthExample(projectName);
  }

  patchAppModuleExampleJobs(projectName, {
    eventJobs: options.eventJobs,
    cronJobs: options.cronJobs,
  });
}

export function stripPersonAuthExample(projectName: string) {
  const controllerPath =
    'src/host/controllers/person/delete-person.controller.ts';

  if (!existsSync(projectFile(projectName, controllerPath))) {
    return;
  }

  let content = readProjectFile(projectName, controllerPath);
  content = removeImportLines(content, [
    '@/core/auth/auth-profile.enum',
    '@/host/decorators/restriction-by-profile.decorator',
    '@/host/decorators/api-exclude-endpoint-diff-develop.decorator',
  ]);
  content = content.replace(
    /\n {2}@RestrictionByProfile\(\[AuthProfile\.admin\]\)\n/,
    '\n',
  );
  content = content.replace(/\n {2}@ApiExcludeEndpointDiffDevelop\(\)\n/, '\n');
  writeProjectFile(projectName, controllerPath, content);
}
