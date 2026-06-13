import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
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
import { HEALTH_PACKAGES } from '@cli/constants/core-packages.ts';
import { installModule, Modules } from '@cli/utils/install-module.ts';

describe('installModule HEALTH', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-health-install-'));

    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'health-test', packageManager: 'bun' }, null, 2)}\n`,
    );

    mkdirSync(path.join(tempDir, 'src/host'), { recursive: true });
    writeFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      `import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({})],
})
export class AppModule {}
`,
    );
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('declara pacotes de health-check no catálogo da CLI', () => {
    expect(HEALTH_PACKAGES).toContain('@nestjs/terminus');
    expect(HEALTH_PACKAGES).toContain('@nestjs/axios');
  });

  it('copia arquivos do health-check e registra módulo no app', async () => {
    await installModule(Modules.HEALTH, 'default', tempDir, {
      skipPackages: true,
    });

    expect(
      existsSync(
        path.join(
          tempDir,
          'src/host/controllers/health-check/health-check.controller.ts',
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(tempDir, 'src/infra/services/database.indicator.service.ts'),
      ),
    ).toBe(true);

    const appModule = readFileSync(
      path.join(tempDir, 'src/host/app.module.ts'),
      'utf8',
    );
    expect(appModule).toContain('HealthCheckModule');
  });

  it('omite RedisIndicator quando cache não está instalado', async () => {
    await installModule(Modules.HEALTH, 'default', tempDir, {
      withRedisIndicator: false,
      skipPackages: true,
    });

    expect(
      existsSync(
        path.join(tempDir, 'src/infra/services/redis.indicator.service.ts'),
      ),
    ).toBe(false);

    const controller = readFileSync(
      path.join(
        tempDir,
        'src/host/controllers/health-check/health-check.controller.ts',
      ),
      'utf8',
    );
    expect(controller).not.toContain('RedisIndicator');
  });
});
