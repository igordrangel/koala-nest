import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

export function patchAppModuleForHealth(content: string) {
  if (content.includes('HealthCheckModule')) {
    return content;
  }

  return content
    .replace(
      "import { Module } from '@nestjs/common';",
      "import { Module } from '@nestjs/common';\nimport { HealthCheckModule } from './controllers/health-check/health-check.module';",
    )
    .replace(
      /(ConfigModule\.forRoot\(\{[\s\S]*?\}\),)\n/,
      '$1\n    HealthCheckModule,\n',
    );
}

const healthCheckControllerWithoutRedis = `import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseIndicator,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  @IsPublic()
  @HealthCheck()
  healthCheck() {
    return this.health.check([() => this.db.isHealthy()]);
  }
}
`;

const healthCheckModuleWithoutRedis = `import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ControllerModule } from '../common/controller.module';
import { HealthCheckController } from './health-check.controller';

@Module({
  imports: [
    ControllerModule,
    DatabaseModule,
    HttpModule,
    TerminusModule.forRoot({
      errorLogStyle: 'pretty',
    }),
  ],
  providers: [DatabaseIndicator],
  controllers: [HealthCheckController],
})
export class HealthCheckModule {}
`;

export function patchHealthCheckWithoutRedis(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);

  writeFileSync(
    path.join(
      projectRoot,
      'src/host/controllers/health-check/health-check.controller.ts',
    ),
    healthCheckControllerWithoutRedis,
    'utf8',
  );
  writeFileSync(
    path.join(
      projectRoot,
      'src/host/controllers/health-check/health-check.module.ts',
    ),
    healthCheckModuleWithoutRedis,
    'utf8',
  );
}

export function restoreRedisHealthCheck(projectName: string) {
  const projectRoot = resolveProjectPath(projectName);
  const sourceRoot = getSourceCodePath();

  for (const relativePath of [
    'src/infra/services/redis.indicator.service.ts',
    'src/host/controllers/health-check/health-check.controller.ts',
    'src/host/controllers/health-check/health-check.module.ts',
  ]) {
    cpSync(
      path.join(sourceRoot, relativePath),
      path.join(projectRoot, relativePath),
      { force: true },
    );
  }
}

export function projectHasRedisHealthCheck(projectName: string) {
  const controllerPath = path.join(
    resolveProjectPath(projectName),
    'src/host/controllers/health-check/health-check.controller.ts',
  );

  if (!readFileSync(controllerPath, 'utf8').includes('RedisIndicator')) {
    return false;
  }

  return true;
}
