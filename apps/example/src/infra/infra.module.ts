import { RepositoriesModule } from '@/infra/database/repositories/repositories.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [RepositoriesModule],
  exports: [RepositoriesModule],
})
export class InfraModule {}
