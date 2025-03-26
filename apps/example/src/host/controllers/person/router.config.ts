import { RouterConfigBase } from '@koalarx/nest/core/controllers/router-config.base'

class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person')
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig()
