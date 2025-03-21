import { Injectable, Type } from '@nestjs/common'
import { AutoMappingList } from './auto-mapping-list'
import { AutoMappingProfile } from './auto-mapping-profile'

@Injectable()
export class AutoMappingService {
  private readonly _contextList = AutoMappingList

  constructor(automappingProfile: AutoMappingProfile) {
    automappingProfile.profile()
  }

  map<S, T>(data: any, source: Type<S>, target: Type<T>): T {
    const context = this._contextList.get(source, target)

    if (!context) {
      throw new Error(
        `No mapping context found for ${source.name} to ${target.name}`,
      )
    }

    return new context.target.prototype.constructor(data)
  }
}
