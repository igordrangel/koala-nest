import { RouterConfigBase } from '@koalarx/nest/common/controllers/router-config.base'

class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person')
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig()
