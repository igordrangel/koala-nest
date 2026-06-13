import { DATA_SOURCE_PROVIDER_TOKEN } from '@/infra/database/data-source-factory';
import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseIndicator {
  constructor(
    private readonly typeOrm: TypeOrmHealthIndicator,
    @Inject(DATA_SOURCE_PROVIDER_TOKEN)
    private readonly dataSource: DataSource,
  ) {}

  isHealthy() {
    return this.typeOrm.pingCheck('db', { connection: this.dataSource });
  }
}
