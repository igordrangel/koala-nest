import { Module } from '@nestjs/common'
import { ControllersModule } from './controllers/controllers.module'
import { RepositoriesModule } from './database/repositories/repositories.module'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'

@Module({
  imports: [KoalaNestModule.register(), RepositoriesModule, ControllersModule],
  providers: [],
})
export class AppModule {}
