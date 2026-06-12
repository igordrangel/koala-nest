import { MappingProvider } from '@/application/mapping/mapping.provider';
import { InfraModule } from '@/infra/infra.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [InfraModule],
  providers: [MappingProvider],
  exports: [InfraModule],
})
export class ControllerModule {}
