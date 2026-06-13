import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { removeImportLines } from './project-files';
import { resolveProjectPath } from './resolve-project-path';

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
    ],
    replace: [
      {
        from: 'providers: [{ provide: IPersonRepository, useClass: PersonRepository }],\n',
        to: '',
      },
      { from: ', IPersonRepository', to: '' },
    ],
  },
  {
    path: 'src/infra/database/data-source-factory.ts',
    removeImports: [
      '@/domain/entities/person/person',
      '@/domain/entities/person/person-address',
      '@/domain/entities/person/person-contact',
    ],
    replace: [
      {
        from: 'entities: [Person, PersonAddress, PersonContact],',
        to: 'entities: [],',
      },
    ],
  },
  {
    path: 'src/host/app.module.ts',
    removeImports: ['./controllers/person/person.module'],
    replace: [{ from: 'PersonModule,\n', to: '' }],
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
  'src/test/application/issue-token.handler.spec.ts',
  'src/test/application/refresh-token.handler.spec.ts',
  'src/test/application/scalar-oauth-token.handler.spec.ts',
  'src/test/application/scalar-password-token.handler.spec.ts',
  'src/test/core/auth.guard.spec.ts',
  'src/test/core/jwt.strategy.spec.ts',
  'src/test/core/oauth-provider.registry.spec.ts',
  'src/test/core/profiles.guard.spec.ts',
  'src/test/host/apply-open-api-security.spec.ts',
  'src/test/host/scalar-authentication.spec.ts',
  'src/test/infra/jwt-token.service.spec.ts',
  'src/test/infra/oauth2-auth.service.spec.ts',
  'src/test/utils/jwt-test-keys.ts',
  'src/host/decorators/scalar-token-endpoint.decorator.ts',
  'src/host/decorators/logged-user.decorator.ts',
  'src/host/decorators/restriction-by-profile.decorator.ts',
];

const scalarAuthenticationStub = `import { INestApplication } from '@nestjs/common';
import { OpenAPIObject } from '@nestjs/swagger';
import type { AuthenticationConfiguration } from '@scalar/types';

export type ScalarAuthenticationSetup = {
  openApiSecuritySchemes: NonNullable<
    OpenAPIObject['components']
  >['securitySchemes'];
  authentication: AuthenticationConfiguration;
  persistAuth: boolean;
};

export async function buildScalarAuthentication(
  _app: INestApplication,
): Promise<ScalarAuthenticationSetup | undefined> {
  return undefined;
}
`;

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

  removePaths(projectName, defaultTemplatePathsToRemove);
}

export async function cleanDefaultTemplateWithoutAuth(projectName: string) {
  removePaths(projectName, defaultTemplatePathsToRemoveWithoutAuth);

  const scalarAuthPath = path.join(
    resolveProjectPath(projectName),
    'src/host/open-api/scalar-authentication.ts',
  );

  mkdirSync(path.dirname(scalarAuthPath), { recursive: true });
  writeFileSync(scalarAuthPath, scalarAuthenticationStub, 'utf8');
}
