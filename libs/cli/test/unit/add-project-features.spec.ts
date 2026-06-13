import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { getSourceCodePath } from '@cli/utils/get-source-code-path.ts';
import { stripPersonAuthExample } from '@cli/utils/patch-person-features.ts';

const installCalls: unknown[][] = [];

mock.module('@cli/utils/run-command.ts', () => ({
  runCommand: async () => {},
}));

mock.module('@cli/utils/format-code.ts', () => ({
  formatCode: async () => {},
}));

const installModuleExports = await import('@cli/utils/install-module.ts');

mock.module('@cli/utils/install-module.ts', () => ({
  ...installModuleExports,
  installModule: async (...args: unknown[]) => {
    installCalls.push(args);
  },
}));

const { addProjectFeatures } =
  await import('@cli/utils/add-project-features.ts');

describe('addProjectFeatures', () => {
  let tempDir = '';
  let previousCwd = process.cwd();

  beforeEach(() => {
    installCalls.length = 0;
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-add-features-'));

    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'add-test', packageManager: 'bun' }, null, 2)}\n`,
    );

    mkdirSync(path.join(tempDir, 'src/core'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    mkdirSync(path.join(tempDir, 'src/infra'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/core/env.ts'),
      'export const envSchema = {};\n',
    );

    mkdirSync(path.join(tempDir, 'src/host/controllers/person'), {
      recursive: true,
    });

    cpSync(
      path.join(
        getSourceCodePath(),
        'src/host/controllers/person/person.module.ts',
      ),
      path.join(tempDir, 'src/host/controllers/person/person.module.ts'),
    );

    cpSync(
      path.join(
        getSourceCodePath(),
        'src/host/controllers/person/delete-person.controller.ts',
      ),
      path.join(
        tempDir,
        'src/host/controllers/person/delete-person.controller.ts',
      ),
    );

    previousCwd = process.cwd();
    process.chdir(tempDir);

    stripPersonAuthExample('.');

    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [ConfigModule.forRoot({}), PersonModule],
})
export class AppModule {}
`,
    );

    writeFileSync(
      path.join(tempDir, 'src/infra/infra.module.ts'),
      'export class InfraModule {}\n',
    );
  });

  afterEach(() => {
    process.chdir(previousCwd);
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('restaura exemplo de auth no delete Person ao adicionar auth jwt', async () => {
    const deletePath = path.join(
      tempDir,
      'src/host/controllers/person/delete-person.controller.ts',
    );

    expect(readFileSync(deletePath, 'utf8')).not.toContain(
      'RestrictionByProfile',
    );

    const results = await addProjectFeatures('.', [
      { kind: 'auth', strategy: 'jwt' },
    ]);

    expect(results).toEqual([{ label: 'auth (jwt)', installed: true }]);
    expect(installCalls.map((call) => call[0])).toEqual([
      installModuleExports.Modules.CACHE,
      installModuleExports.Modules.AUTH,
    ]);

    const restored = readFileSync(deletePath, 'utf8');
    expect(restored).toContain('RestrictionByProfile');
    expect(restored).toContain('AuthProfile.admin');
  });

  it('ignora auth quando já instalada', async () => {
    mkdirSync(path.join(tempDir, 'src/host/controllers/auth'), {
      recursive: true,
    });

    writeFileSync(
      path.join(tempDir, 'src/host/controllers/auth/auth.module.ts'),
      'export class AuthModule {}\n',
    );
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { AuthModule } from './controllers/auth/auth.module';
import { SecurityModule } from './security/security.module';
import { PersonModule } from './controllers/person/person.module';

@Module({
  imports: [AuthModule, SecurityModule, PersonModule],
})
export class AppModule {}
`,
    );

    const results = await addProjectFeatures('.', [
      { kind: 'auth', strategy: 'jwt' },
    ]);

    expect(results[0]?.installed).toBe(false);
    expect(installCalls).toHaveLength(0);
  });
});
