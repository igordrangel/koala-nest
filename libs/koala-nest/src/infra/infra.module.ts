import { Module } from '@nestjs/common';
import { RepositoryModule } from './repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  exports: [RepositoryModule],
})
export class InfraModule {}
