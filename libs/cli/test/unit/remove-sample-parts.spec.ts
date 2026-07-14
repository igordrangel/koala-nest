import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'bun:test';
import {
  cleanDefaultTemplateWithoutAuth,
  removeSampleParts,
} from '@cli/utils/remove-sample-parts.ts';

describe('removeSampleParts', () => {
  let tempDir = '';

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  it('remove referências ao módulo Person do template padrão', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    const srcDir = path.join(tempDir, 'src');
    mkdirSync(path.join(srcDir, 'host'), { recursive: true });
    mkdirSync(path.join(srcDir, 'infra/repositories'), { recursive: true });
    mkdirSync(path.join(srcDir, 'application/mapping'), { recursive: true });
    mkdirSync(path.join(srcDir, 'test/application'), { recursive: true });

    const templateRepositoryModule = path.resolve(
      import.meta.dir,
      '../../../koala-nest/src/infra/repositories/repository.module.ts',
    );
    writeFileSync(
      path.join(srcDir, 'host/app.module.ts'),
      `import { PersonModule } from './controllers/person/person.module';\n@Module({ imports: [PersonModule,\n] })`,
    );
    writeFileSync(
      path.join(srcDir, 'infra/repositories/repository.module.ts'),
      readFileSync(templateRepositoryModule, 'utf8'),
    );
    writeFileSync(
      path.join(srcDir, 'application/mapping/mapping.provider.ts'),
      `import { PersonMapper } from './person.mapper';\nPersonMapper.createMap();`,
    );
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ packageManager: 'bun', scripts: { lint: 'echo lint', format: 'echo format' } }, null, 2)}\n`,
    );

    const previousCwd = process.cwd();
    process.chdir(tempDir);

    try {
      await removeSampleParts('.');

      const appModule = readFileSync(
        path.join(srcDir, 'host/app.module.ts'),
        'utf8',
      );
      expect(appModule).not.toContain('PersonModule');
      const repositoryModule = readFileSync(
        path.join(srcDir, 'infra/repositories/repository.module.ts'),
        'utf8',
      );
      expect(repositoryModule).not.toContain('IPersonRepository');
      expect(repositoryModule).not.toContain('PersonRepository');
      expect(repositoryModule).not.toContain('IUserRepository');
      expect(repositoryModule).not.toContain('IApiKeyRepository');
      expect(repositoryModule).toContain('exports: [DatabaseModule]');
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('remove arquivos de auth ao limpar template default sem auth', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    const srcDir = path.join(tempDir, 'src');
    mkdirSync(path.join(srcDir, 'host/decorators'), { recursive: true });
    mkdirSync(path.join(srcDir, 'test/host'), { recursive: true });
    mkdirSync(path.join(srcDir, 'application/auth/login'), { recursive: true });
    mkdirSync(path.join(srcDir, 'domain/services'), { recursive: true });
    mkdirSync(path.join(srcDir, 'core/auth'), { recursive: true });

    writeFileSync(
      path.join(srcDir, 'host/decorators/scalar-token-endpoint.decorator.ts'),
      'export const ScalarTokenEndpoint = () => {};\n',
    );
    writeFileSync(
      path.join(srcDir, 'test/host/is-public-open-api.spec.ts'),
      "describe('auth', () => {});\n",
    );
    writeFileSync(
      path.join(srcDir, 'application/auth/login/login.handler.ts'),
      'export class LoginHandler {}\n',
    );
    writeFileSync(
      path.join(srcDir, 'domain/services/ilogged-user-info.service.ts'),
      'export abstract class ILoggedUserInfoService {}\n',
    );
    writeFileSync(
      path.join(srcDir, 'core/auth/jwt-claims.ts'),
      'export type AuthenticatedUser = {};\n',
    );
    writeFileSync(
      path.join(srcDir, 'core/auth/parse-oauth2-provider-env.ts'),
      'export function parseOauth2ProviderEnv() {}\n',
    );

    const previousCwd = process.cwd();
    process.chdir(tempDir);

    try {
      await cleanDefaultTemplateWithoutAuth('.');

      expect(
        existsSync(
          path.join(
            srcDir,
            'host/decorators/scalar-token-endpoint.decorator.ts',
          ),
        ),
      ).toBe(false);
      expect(
        existsSync(path.join(srcDir, 'test/host/is-public-open-api.spec.ts')),
      ).toBe(false);
      expect(
        existsSync(path.join(srcDir, 'application/auth/login/login.handler.ts')),
      ).toBe(false);
      expect(
        existsSync(
          path.join(srcDir, 'domain/services/ilogged-user-info.service.ts'),
        ),
      ).toBe(false);
      expect(existsSync(path.join(srcDir, 'core/auth/jwt-claims.ts'))).toBe(
        false,
      );
      expect(existsSync(path.join(srcDir, 'core/auth'))).toBe(false);
    } finally {
      process.chdir(previousCwd);
    }
  });
});
