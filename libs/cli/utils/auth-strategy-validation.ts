import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import {
  appModuleMustContain,
  appModuleMustNotContain,
  authModuleMustContain,
  authModuleMustNotContain,
  cacheConstantsMustContain,
  cacheConstantsMustNotContain,
  defineDocumentationMustContain,
  defineDocumentationMustNotContain,
  envExampleMustContain,
  envExampleMustNotContain,
  envSourceMustContain,
  envSourceMustNotContain,
  forbiddenContentPatterns,
  forbiddenPathsForProfile,
  iauthMustContain,
  iauthMustNotContain,
  requiredPathsForProfile,
  resolveAuthProfile,
  securityModuleMustContain,
  securityModuleMustNotContain,
  type AuthProfile,
  type AuthStrategySelection,
} from '@cli/constants/auth-strategy-checklist';
import { resolveProjectPath } from './resolve-project-path';

const CONTENT_SCAN_SKIP = new Set([
  'src/host/open-api/define-documentation.ts',
  'src/test/host/is-public-open-api.spec.ts',
  'src/test/core/auth.guard.spec.ts',
]);

function walkSourceFiles(
  directory: string,
  callback: (absolutePath: string, relativePath: string) => void,
) {
  if (!existsSync(directory)) {
    return;
  }

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkSourceFiles(absolutePath, (abs, rel) => {
        callback(abs, path.join(entry.name, rel));
      });
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.ts')) {
      callback(absolutePath, entry.name);
    }
  }
}

function isOAuthPathSegment(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();

  return (
    normalized.includes('/oauth2/') ||
    normalized.includes('/oauth2.') ||
    /(^|\/)oauth[^/]*\.ts$/.test(normalized) ||
    /oauth2[^/]*\.ts$/.test(normalized)
  );
}

function isJwtLoginPathSegment(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/').toLowerCase();

  return (
    normalized.includes('/auth/login') ||
    normalized.includes('login.controller.ts') ||
    normalized.includes('login.handler.spec.ts')
  );
}

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

export function listAuthStrategyViolations(
  projectName = '',
  selection: AuthStrategySelection,
): string[] {
  const profile = resolveAuthProfile(selection);
  const projectRoot = resolveProjectPath(projectName);
  const violations: string[] = [];

  for (const relativePath of requiredPathsForProfile(profile)) {
    if (!existsSync(path.join(projectRoot, relativePath))) {
      violations.push(`path:obrigatório ausente ${relativePath}`);
    }
  }

  for (const relativePath of forbiddenPathsForProfile(profile)) {
    if (existsSync(path.join(projectRoot, relativePath))) {
      violations.push(`path:proibido presente ${relativePath}`);
    }
  }

  const srcDir = path.join(projectRoot, 'src');

  if (profile === 'none') {
    walkSourceFiles(srcDir, (_absolutePath, relativePath) => {
      const normalized = relativePath.replace(/\\/g, '/');

      if (isOAuthPathSegment(normalized) || isJwtLoginPathSegment(normalized)) {
        violations.push(`path:src/${normalized}`);
      }
    });
  }

  if (profile === 'jwt') {
    walkSourceFiles(srcDir, (_absolutePath, relativePath) => {
      const normalized = relativePath.replace(/\\/g, '/');

      if (isOAuthPathSegment(normalized)) {
        violations.push(`path:oauth2 inesperado src/${normalized}`);
      }
    });
  }

  if (profile === 'oauth2') {
    walkSourceFiles(srcDir, (_absolutePath, relativePath) => {
      const normalized = relativePath.replace(/\\/g, '/');

      if (isJwtLoginPathSegment(normalized)) {
        violations.push(`path:login jwt inesperado src/${normalized}`);
      }
    });
  }

  const envExample = readOptional(projectRoot, '.env.example');
  const envSource = readOptional(projectRoot, 'src/core/env.ts');
  const iauth = readOptional(
    projectRoot,
    'src/domain/auth/services/iauth.service.ts',
  );
  const authModule = readOptional(
    projectRoot,
    'src/host/controllers/auth/auth.module.ts',
  );
  const securityModule = readOptional(
    projectRoot,
    'src/host/security/security.module.ts',
  );
  const appModule = readOptional(projectRoot, 'src/host/app.module.ts');
  const cacheConstants = readOptional(
    projectRoot,
    'src/core/constants/cache.constants.ts',
  );
  const defineDocumentation = readOptional(
    projectRoot,
    'src/host/open-api/define-documentation.ts',
  );

  expectContains(violations, 'env.example', envExample, envExampleMustContain(profile));
  expectNotContains(
    violations,
    'env.example',
    envExample,
    envExampleMustNotContain(profile),
  );
  expectContains(violations, 'env.ts', envSource, envSourceMustContain(profile));
  expectNotContains(
    violations,
    'env.ts',
    envSource,
    envSourceMustNotContain(profile),
  );
  expectContains(violations, 'iauth.service', iauth, iauthMustContain(profile));
  expectNotContains(
    violations,
    'iauth.service',
    iauth,
    iauthMustNotContain(profile),
  );
  expectContains(
    violations,
    'auth.module',
    authModule,
    authModuleMustContain(profile),
  );
  expectNotContains(
    violations,
    'auth.module',
    authModule,
    authModuleMustNotContain(profile),
  );
  expectContains(
    violations,
    'security.module',
    securityModule,
    securityModuleMustContain(profile),
  );
  expectNotContains(
    violations,
    'security.module',
    securityModule,
    securityModuleMustNotContain(profile),
  );
  expectContains(
    violations,
    'app.module',
    appModule,
    appModuleMustContain(profile),
  );
  expectNotContains(
    violations,
    'app.module',
    appModule,
    appModuleMustNotContain(profile),
  );
  expectContains(
    violations,
    'cache.constants',
    cacheConstants,
    cacheConstantsMustContain(profile),
  );
  expectNotContains(
    violations,
    'cache.constants',
    cacheConstants,
    cacheConstantsMustNotContain(profile),
  );
  expectContains(
    violations,
    'define-documentation',
    defineDocumentation,
    defineDocumentationMustContain(profile),
  );
  expectNotContains(
    violations,
    'define-documentation',
    defineDocumentation,
    defineDocumentationMustNotContain(profile),
  );

  const forbiddenPatterns = forbiddenContentPatterns(profile);

  if (forbiddenPatterns.length > 0) {
    walkSourceFiles(srcDir, (absolutePath, relativePath) => {
      const normalized = relativePath.replace(/\\/g, '/');
      const srcRelative = `src/${normalized}`;

      if (CONTENT_SCAN_SKIP.has(srcRelative)) {
        return;
      }

      const source = readFileSync(absolutePath, 'utf8');

      for (const pattern of forbiddenPatterns) {
        if (source.includes(pattern)) {
          violations.push(`content:${srcRelative} contém "${pattern}"`);
        }
      }
    });
  }

  return [...new Set(violations)].sort();
}

export function assertAuthStrategyProject(
  projectName = '',
  selection: AuthStrategySelection,
) {
  const profile = resolveAuthProfile(selection);
  const violations = listAuthStrategyViolations(projectName, selection);

  if (violations.length > 0) {
    throw new Error(
      `Checklist auth "${profile}" falhou:\n${violations.join('\n')}`,
    );
  }
}

export function assertNoOAuthArtifactsInProject(projectName = '') {
  assertAuthStrategyProject(projectName, [AuthStrategy.JWT]);
}

export function listOAuthArtifactViolations(projectName = '') {
  return listAuthStrategyViolations(projectName, [AuthStrategy.JWT]).filter(
    (item) => !item.startsWith('path:obrigatório'),
  );
}
