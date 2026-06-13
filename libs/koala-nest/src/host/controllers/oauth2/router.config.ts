import { RouterConfigBase } from '../common/router-config.base';

class OAuthRouterConfig extends RouterConfigBase {
  constructor() {
    super('OAuth2', '/oauth2');
  }
}

export const OAUTH_ROUTER_CONFIG = new OAuthRouterConfig();
