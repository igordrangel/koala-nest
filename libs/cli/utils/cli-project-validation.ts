import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  appModuleMustContain,
  appModuleMustNotContain,
  buildProjectExpectation,
  forbiddenPathsForExpectation,
  healthControllerMustContain,
  healthControllerMustNotContain,
  infraModuleMustContain,
  infraModuleMustNotContain,
  requiredPackagesForExpectation,
  requiredPathsForExpectation,
  type ProjectExpectation,
} from '@cli/constants/cli-project-checklist';
import { AuthStrategy, ExtraFeature, Template } from '@cli/constants/domain';
import { detectProjectState } from './detect-project-state';
import { resolveProjectPath } from './resolve-project-path';
import { assertAuthStrategyProject } from './auth-strategy-validation';

function readOptional(projectRoot: string, relativePath: string) {
  const filePath = path.join(projectRoot, relativePath);

  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : null;
}

function expectContains(
  violations: string[],
  label: string,
  source: string | null,
  patterns: readonly string[],
) {
  if (!source) {
    if (patterns.length > 0) {
      violations.push(`missing:${label}`);
    }

    return;
  }

  for (const pattern of patterns) {
    if (!source.includes(pattern)) {
      violations.push(`${label}: ausente "${pattern}"`);
    }
  }
}

function expectNotContains(
  violations: string[],
  label: string,
  source: string | null,
  patterns: readonly string[],
) {
  if (!source) {
    return;
  }

  for (const pattern of patterns) {
    if (source.includes(pattern)) {
      violations.push(`${label}: inesperado "${pattern}"`);
    }
  }
}

function readInstalledPackages(projectRoot: string) {
  const packageJsonPath = path.join(projectRoot, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  return {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
}

export function listCliProjectViolations(
  projectName = '',
  expectation: ProjectExpectation,
): string[] {
  const projectRoot = resolveProjectPath(projectName);
  const violations: string[] = [];

  for (const relativePath of requiredPathsForExpectation(expectation)) {
    if (!existsSync(path.join(projectRoot, relativePath))) {
      violations.push(`path:obrigatório ausente ${relativePath}`);
    }
  }

  for (const relativePath of forbiddenPathsForExpectation(expectation)) {
    if (existsSync(path.join(projectRoot, relativePath))) {
      violations.push(`path:proibido presente ${relativePath}`);
    }
  }

  const appModule = readOptional(projectRoot, 'src/host/app.module.ts');
  const infraModule = readOptional(projectRoot, 'src/infra/infra.module.ts');
  const healthController = readOptional(
    projectRoot,
    'src/host/controllers/health-check/health-check.controller.ts',
  );

  expectContains(
    violations,
    'app.module',
    appModule,
    appModuleMustContain(expectation),
  );
  expectNotContains(
    violations,
    'app.module',
    appModule,
    appModuleMustNotContain(expectation),
  );
  expectContains(
    violations,
    'infra.module',
    infraModule,
    infraModuleMustContain(expectation),
  );
  expectNotContains(
    violations,
    'infra.module',
    infraModule,
    infraModuleMustNotContain(expectation),
  );
  expectContains(
    violations,
    'health-check.controller',
    healthController,
    healthControllerMustContain(expectation),
  );
  expectNotContains(
    violations,
    'health-check.controller',
    healthController,
    healthControllerMustNotContain(expectation),
  );

  if (expectation.template === Template.CRUD_SAMPLE) {
    const deletePerson = readOptional(
      projectRoot,
      'src/host/controllers/person/delete-person.controller.ts',
    );
    expectContains(violations, 'delete-person.controller', deletePerson, [
      'RestrictionByProfile',
    ]);
  }

  const nestCliPath = path.join(projectRoot, 'nest-cli.json');

  if (existsSync(nestCliPath)) {
    const nestCli = JSON.parse(readFileSync(nestCliPath, 'utf8')) as {
      entryFile?: string;
    };

    if (nestCli.entryFile !== 'host/main') {
      violations.push('nest-cli.json: entryFile deve ser "host/main"');
    }
  }

  const packageJson = readOptional(projectRoot, 'package.json');

  if (packageJson?.includes('"start:prod": "node dist/host/main"') === false) {
    violations.push('package.json: start:prod deve apontar para dist/host/main');
  }

  const installed = readInstalledPackages(projectRoot);

  if (installed) {
    for (const dependency of requiredPackagesForExpectation(expectation)) {
      if (!installed[dependency]) {
        violations.push(`package:obrigatório ausente ${dependency}`);
      }
    }

    if (expectation.cache !== 'redis' && installed.ioredis) {
      violations.push('package:proibido presente ioredis');
    }

    if (!expectation.cronJobs && installed['cron-parser']) {
      violations.push('package:proibido presente cron-parser');
    }

    if (!expectation.health && installed['@nestjs/terminus']) {
      violations.push('package:proibido presente @nestjs/terminus');
    }
  }

  try {
    const detected = detectProjectState(projectName);

    if (detected.template !== expectation.template) {
      violations.push(
        `state:template esperado ${expectation.template}, detectado ${detected.template}`,
      );
    }

    if (detected.cache !== expectation.cache) {
      violations.push(
        `state:cache esperado ${String(expectation.cache)}, detectado ${String(detected.cache)}`,
      );
    }

    if (detected.health !== expectation.health) {
      violations.push(
        `state:health esperado ${expectation.health}, detectado ${detected.health}`,
      );
    }

    if (detected.cronJobs !== expectation.cronJobs) {
      violations.push(
        `state:cronJobs esperado ${expectation.cronJobs}, detectado ${detected.cronJobs}`,
      );
    }

    if (detected.eventJobs !== expectation.eventJobs) {
      violations.push(
        `state:eventJobs esperado ${expectation.eventJobs}, detectado ${detected.eventJobs}`,
      );
    }

    const expectedAuth =
      expectation.auth === false
        ? false
        : [...expectation.auth].sort().join(',');

    const detectedAuth =
      detected.auth === false ? false : [...detected.auth].sort().join(',');

    if (expectedAuth !== detectedAuth) {
      violations.push(
        `state:auth esperado ${String(expectedAuth)}, detectado ${String(detectedAuth)}`,
      );
    }
  } catch (error) {
    violations.push(
      `state:${error instanceof Error ? error.message : String(error)}`,
    );
  }

  return [...new Set(violations)].sort();
}

export function assertCliProject(
  projectName = '',
  expectation: ProjectExpectation,
) {
  const violations = listCliProjectViolations(projectName, expectation);

  if (violations.length > 0) {
    throw new Error(
      `Checklist CLI falhou (${expectation.template}, auth=${expectation.auth === false ? 'none' : expectation.auth.join('+')}):\n${violations.join('\n')}`,
    );
  }

  if (expectation.auth !== false) {
    assertAuthStrategyProject(projectName, expectation.auth);
  } else {
    assertAuthStrategyProject(projectName, false);
  }
}

export function assertCliProjectFromSelection(
  projectName = '',
  template: Template,
  auth: readonly AuthStrategy[],
  features: readonly ExtraFeature[],
) {
  assertCliProject(projectName, buildProjectExpectation(template, auth, features));
}

export { buildProjectExpectation, type ProjectExpectation };
