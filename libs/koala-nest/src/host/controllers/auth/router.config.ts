import { RouterConfigBase } from '../common/router-config.base';

class AuthRouterConfig extends RouterConfigBase {
  constructor() {
    super('Auth', '/auth');
  }
}

export const AUTH_ROUTER_CONFIG = new AuthRouterConfig();
