import { RouterConfigBase } from '../common/router-config.base';

class ApiKeyRouterConfig extends RouterConfigBase {
  constructor() {
    super('ApiKey', '/api-key');
  }
}

export const API_KEY_ROUTER_CONFIG = new ApiKeyRouterConfig();
