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
    mkdirSync(path.join(srcDir, 'infra/database'), { recursive: true });
    mkdirSync(path.join(srcDir, 'application/mapping'), { recursive: true });
    mkdirSync(path.join(srcDir, 'test/application'), { recursive: true });

    writeFileSync(
      path.join(srcDir, 'host/app.module.ts'),
      `import { PersonModule } from './controllers/person/person.module';\n@Module({ imports: [PersonModule,\n] })`,
    );
    writeFileSync(
      path.join(srcDir, 'infra/repositories/repository.module.ts'),
      `import { IPersonRepository } from '@/domain/repositories/iperson.repository';\nimport { PersonRepository } from '@/infra/repositories/person.repository';\nproviders: [{ provide: IPersonRepository, useClass: PersonRepository }],\nexports: [DatabaseModule, IPersonRepository],`,
    );
    writeFileSync(
      path.join(srcDir, 'infra/database/data-source-factory.ts'),
      `import { Person } from '@/domain/entities/person/person';\nentities: [Person, PersonAddress, PersonContact],`,
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
      expect(
        readFileSync(
          path.join(srcDir, 'infra/repositories/repository.module.ts'),
          'utf8',
        ),
      ).not.toContain('IPersonRepository');
      expect(
        readFileSync(
          path.join(srcDir, 'infra/repositories/repository.module.ts'),
          'utf8',
        ),
      ).not.toContain('PersonRepository');
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('substitui scalar-authentication por stub quando auth é none', async () => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-nest-cli-'));
    const srcDir = path.join(tempDir, 'src');
    mkdirSync(path.join(srcDir, 'host/open-api'), { recursive: true });
    mkdirSync(path.join(srcDir, 'host/decorators'), { recursive: true });

    writeFileSync(
      path.join(srcDir, 'host/open-api/scalar-authentication.ts'),
      "import { IJwtTokenService } from '@/domain/auth/services/iauth.service';\n",
    );
    writeFileSync(
      path.join(srcDir, 'host/decorators/scalar-token-endpoint.decorator.ts'),
      'export const ScalarTokenEndpoint = () => {};\n',
    );

    const previousCwd = process.cwd();
    process.chdir(tempDir);

    try {
      await cleanDefaultTemplateWithoutAuth('.');

      expect(
        readFileSync(
          path.join(srcDir, 'host/open-api/scalar-authentication.ts'),
          'utf8',
        ),
      ).toContain('return undefined');
      expect(
        existsSync(
          path.join(
            srcDir,
            'host/decorators/scalar-token-endpoint.decorator.ts',
          ),
        ),
      ).toBe(false);
    } finally {
      process.chdir(previousCwd);
    }
  });
});
