import { AutoMappingProfile } from '@koalarx/nest/core/mapping/auto-mapping-profile'
import { Injectable } from '@nestjs/common'
import { PersonMapping } from './person.mapping'

@Injectable()
export class MappingProfile implements AutoMappingProfile {
  profile(): void {
    PersonMapping.createMap()
  }
}
