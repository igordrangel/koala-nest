import { PersonModule } from '@/host/controllers/person/person.module'
import { KoalaNestModule } from '@koalarx/nest/core/koala-nest.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [
    KoalaNestModule.register({
      controllers: [PersonModule],
    }),
  ],
})
export class AppTestModule {}
