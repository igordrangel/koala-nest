import { Mapper, MappingProfile as Profile } from 'automapper-core'
import { AutomapperProfile, InjectMapper } from 'automapper-nestjs'
import { PersonMapping } from '../person/mapping/person.mapping'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MappingProfile extends AutomapperProfile {
  constructor(
    // @ts-ignore
    @InjectMapper() mapper: Mapper,
  ) {
    super(mapper)
  }

  get profile(): Profile {
    return (mapper: Mapper) => {
      PersonMapping.createMap(mapper)
    }
  }
}
