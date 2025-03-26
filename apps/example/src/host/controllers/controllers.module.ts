import { Module } from '@nestjs/common'
import { ControllerModule } from './controller.module'
import { PersonModule } from './person/person.module'

@Module({
  imports: [
    ControllerModule,
    PersonModule,
  ],
  exports: [ControllerModule],
})
export class ControllersModule {}
