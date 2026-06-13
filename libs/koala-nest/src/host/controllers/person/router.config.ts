import { RouterConfigBase } from '../common/router-config.base';

class PersonRouterConfig extends RouterConfigBase {
  constructor() {
    super('Person', '/person');
  }
}

export const PERSON_ROUTER_CONFIG = new PersonRouterConfig();
