import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
import { RedisIndicator } from '@/infra/services/redis.indicator.service';
import { IsPublic } from '@/host/decorators/is-public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseIndicator,
    private readonly redis: RedisIndicator,
  ) {}

  @ApiExcludeEndpoint()
  @Get()
  @IsPublic()
  @HealthCheck()
  healthCheck() {
    const checks = [() => this.db.isHealthy()];

    if (this.redis.isConfigured()) {
      checks.push(() => this.redis.isHealthy());
    }

    return this.health.check(checks);
  }
}
