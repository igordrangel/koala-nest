import { DatabaseIndicator } from '@/infra/services/database.indicator.service';
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
