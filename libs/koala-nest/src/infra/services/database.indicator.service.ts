import { DATA_SOURCE_PROVIDER_TOKEN } from '@/infra/database/data-source-factory';
import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DATA_SOURCE_PROVIDER_TOKEN)
    private readonly dataSource: DataSource,
  ) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('db');

    try {
      if (!this.dataSource.isInitialized) {
        return indicator.down({ message: 'DataSource not initialized' });
      }

      await this.dataSource.query('SELECT 1');

      return indicator.up();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return indicator.down({ message });
    }
  }
}
