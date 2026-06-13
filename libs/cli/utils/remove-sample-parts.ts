import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { removeImportLines } from './project-files';
import { patchAppModuleJobs } from './patch-jobs-module';
import { resolveProjectPath } from './resolve-project-path';
import { stripMainOptionalFeatures } from './patch-main';
import { stripDefineDocumentationAuth } from './patch-define-documentation';

interface PartsToRemove {
  path: string;
  removeImports?: string[];
  replace?: {
    from: string;
    to: string;
  }[];
}

const partsToRemove: PartsToRemove[] = [
  {
    path: 'src/infra/repositories/repository.module.ts',
    removeImports: [
      '@/domain/repositories/iperson.repository',
      '@/infra/repositories/person.repository',
      './person.repository',
      '@/domain/repositories/iuser.repository',
      '@/infra/repositories/user.repository',
    ],
    replace: [
      {
        from: 'providers: [\n    { provide: IPersonRepository, useClass: PersonRepository },\n    { provide: IUserRepository, useClass: UserRepository },\n  ],\n',
        to: '',
      },
      {
        from: 'providers: [{ provide: IPersonRepository, useClass: PersonRepository }],\n',
        to: '',
      },
      {
        from: 'providers: [{ provide: IUserRepository, useClass: UserRepository }],\n',
        to: '',
      },
      { from: ', IPersonRepository', to: '' },
      { from: ', IUserRepository', to: '' },
    ],
  },
  {
    path: 'src/infra/database/data-source-factory.ts',
    removeImports: [
      '@/domain/entities/person/person',
      '@/domain/entities/person/person-address',
      '@/domain/entities/person/person-contact',
      '@/domain/entities/user/user',
    ],
    replace: [
      {
        from: 'entities: [Person, PersonAddress, PersonContact, User],',
        to: 'entities: [],',
      },
      {
        from: 'entities: [Person, PersonAddress, PersonContact],',
        to: 'entities: [],',
      },
      {
        from: 'entities: [User],',
        to: 'entities: [],',
      },
    ],
  },
  {
    path: 'src/host/app.module.ts',
    removeImports: [
      './controllers/person/person.module',
      '@/application/person/jobs/events/person/inactive-person/inactive-person.handler',
      '@/application/person/jobs/cron/create-person.job',
      '@/application/person/jobs/cron/delete-inactive.job',
    ],
    replace: [
      { from: 'PersonModule,\n', to: '' },
      { from: 'imports: [PersonModule],\n      ', to: '' },
    ],
  },
  {
    path: 'src/application/mapping/mapping.provider.ts',
    removeImports: ['./person.mapper'],
    replace: [{ from: 'PersonMapper.createMap();', to: '' }],
  },
];

const defaultTemplatePathsToRemove = [
  'src/test/application',
  'src/test/mockup/person',
  'src/test/host/controllers/person/person.controller.e2e.spec.ts',
  'src/test/host/controllers/person/lazy-loading.e2e.spec.ts',
  'src/test/host/controllers/auth/auth.controller.e2e.spec.ts',
  'src/test/app-auth-test.module.ts',
  'src/test/create-auth-e2e-test-app.ts',
];

const defaultTemplatePathsToRemoveWithoutAuth = [
  'src/test/application/auth-link.handler.spec.ts',
  'src/test/application/exchange-code.handler.spec.ts',
  'src/test/application/login.handler.spec.ts',
  'src/test/application/refresh-token.handler.spec.ts',
  'src/test/application/scalar-oauth-token.handler.spec.ts',
  'src/test/core/auth.guard.spec.ts',
  'src/test/core/jwt.strategy.spec.ts',
  'src/test/core/oauth-provider.registry.spec.ts',
  'src/test/core/profiles.guard.spec.ts',
  'src/test/host/is-public-open-api.spec.ts',
  'src/test/infra/jwt-token.service.spec.ts',
  'src/test/infra/oauth2-auth.service.spec.ts',
  'src/test/utils/jwt-test-keys.ts',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/host/decorators/restriction-by-profile.decorator.ts',
];

function removePaths(projectName: string, paths: string[]) {
  for (const relativePath of paths) {
    rmSync(path.join(resolveProjectPath(projectName), relativePath), {
      recursive: true,
      force: true,
    });
  }
}

export async function removeSampleParts(projectName: string) {
  for (const part of partsToRemove) {
    const partPath = path.join(resolveProjectPath(projectName), part.path);

    let content = readFileSync(partPath, 'utf8');

    if (part.removeImports?.length) {
      content = removeImportLines(content, part.removeImports);
    }

    for (const replace of part.replace ?? []) {
      content = content.replace(replace.from, replace.to);
    }

    writeFileSync(partPath, content, 'utf8');
  }

  patchAppModuleJobs(projectName, { eventHandlers: [], cronJobs: [] });

  removePaths(projectName, defaultTemplatePathsToRemove);
}

export async function cleanDefaultTemplateWithoutAuth(projectName: string) {
  stripDefaultProjectAuth(projectName);
  stripDefineDocumentationAuth(projectName);
  removePaths(projectName, defaultTemplatePathsToRemoveWithoutAuth);
}

function stripDefaultProjectAuth(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);
  const appModulePath = path.join(projectRoot, 'src/host/app.module.ts');
  const mainPath = path.join(projectRoot, 'src/host/main.ts');

  if (existsSync(appModulePath)) {
    patchAppModuleJobs(projectName, { eventHandlers: [], cronJobs: [] });

    let appModule = readFileSync(appModulePath, 'utf8');
    appModule = removeImportLines(appModule, [
      './controllers/auth/auth.module',
      './security/security.module',
    ]);
    appModule = appModule
      .replace(/\s*SecurityModule,\n/g, '')
      .replace(/\s*AuthModule,\n/g, '');
    writeFileSync(appModulePath, appModule, 'utf8');
  }

  if (existsSync(mainPath)) {
    let main = readFileSync(mainPath, 'utf8');
    main = removeImportLines(main, [
      './security/guards/auth.guard',
      './security/guards/profiles.guard',
    ]);
    main = main.replace(/\n {2}app\.useGlobalGuards\([\s\S]*?\);\n/, '\n');
    writeFileSync(mainPath, stripMainOptionalFeatures(main), 'utf8');
  }
}
