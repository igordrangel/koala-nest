import { DynamicModule, Module, Type } from '@nestjs/common'
import { AutoMappingProfile } from './auto-mapping-profile'
import { AutoMappingService } from './auto-mapping.service'

@Module({})
export class AutoMappingModule {
  static register(profile: Type<AutoMappingProfile>): DynamicModule {
    return {
      module: AutoMappingModule,
      providers: [
        { provide: AutoMappingProfile, useClass: profile },
        AutoMappingService,
      ],
      exports: [AutoMappingService],
    }
  }
}
