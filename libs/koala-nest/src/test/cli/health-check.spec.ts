import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { patchAppModuleForHealth } from '@cli/utils/patch-health-module.ts';

const appModule = `import { envSchema } from '@/core/env';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
  ],
})
export class AppModule {}
`;

describe('health-check', () => {
  it('registra HealthCheckModule no app.module', () => {
    const patched = patchAppModuleForHealth(appModule);

    expect(patched).toContain('HealthCheckModule');
    expect(patched).toContain('./controllers/health-check/health-check.module');
  });

  it('segue padrão Globo Seguros com Terminus e indicadores', () => {
    const root = path.join(process.cwd(), 'src/host/controllers/health-check');
    const controller = readFileSync(
      path.join(root, 'health-check.controller.ts'),
      'utf8',
    );
    const module = readFileSync(
      path.join(root, 'health-check.module.ts'),
      'utf8',
    );

    expect(controller).toContain('@HealthCheck()');
    expect(controller).toContain('@IsPublic()');
    expect(controller).toContain('DatabaseIndicator');
    expect(controller).toContain('RedisIndicator');
    expect(module).toContain('TerminusModule.forRoot');
  });
});
