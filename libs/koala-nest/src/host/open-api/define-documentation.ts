import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import { EnvConfig } from '@/core/utils/env.config';
import {
  isProviderRegistered,
  resolveAppProvider,
} from '@/core/utils/is-provider-registered';
import { resolveApiHost } from '@/core/utils/resolve-api-host';
import {
  IJwtTokenService,
  IOAuth2Service,
} from '@/domain/auth/services/iauth.service';
import {
  applyAuthSecurityToProtectedRoutes,
  syncIsPublicRoutesInOpenApi,
} from '@/host/decorators/is-public.decorator';
import { SecurityModule } from '@/host/security/security.module';
import { EnvService } from '@/infra/common/env.service';
import { INestApplication } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import packageJson from '../../../package.json';

const DOC_ENDPOINT = '/doc';
const ACCESS_TOKEN_FIELD = 'accessToken';

type DocAuthorization = {
  name: string;
  config: Record<string, unknown>;
};

function capitalizeProvider(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function hasController(app: INestApplication, controllerName: string) {
  const modulesContainer = app.get(ModulesContainer);

  for (const moduleRef of modulesContainer.values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      if (wrapper.metatype?.name === controllerName) {
        return true;
      }
    }
  }

  return false;
}

function resolveOAuthProviderRegistry(app: INestApplication) {
  const fromContainer = resolveAppProvider<OAuthProviderRegistry>(
    app,
    OAuthProviderRegistry,
  );

  if (fromContainer) {
    return fromContainer;
  }

  try {
    return app.select(SecurityModule).get(OAuthProviderRegistry, {
      strict: false,
    });
  } catch {
    return undefined;
  }
}

async function buildDocAuthorizations(
  app: INestApplication,
): Promise<DocAuthorization[]> {
  if (!isProviderRegistered(app, IJwtTokenService)) {
    return [];
  }

  const env = app.get(EnvService);
  const hostAddress = resolveApiHost(env.get('API_HOST'), env.get('PORT'));
  const isDevelop = EnvConfig.isEnvDevelop;
  const refreshUrl = `${hostAddress}/auth/refresh`;
  const authorizations: DocAuthorization[] = [];

  if (hasController(app, 'LoginController')) {
    authorizations.push({
      name: 'JWT',
      config: {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: `${hostAddress}/auth/login`,
            refreshUrl,
            username: isDevelop ? 'admin@example.com' : '',
            password: isDevelop ? 'admin123' : '',
            'x-tokenName': ACCESS_TOKEN_FIELD,
          },
        },
      },
    });
  }

  if (
    isProviderRegistered(app, IOAuth2Service) &&
    hasController(app, 'OAuthExchangeCodeController')
  ) {
    const oauth2Service = app.get(IOAuth2Service);
    const providerRegistry = resolveOAuthProviderRegistry(app);

    if (providerRegistry) {
      for (const providerKey of providerRegistry.listConfiguredProviders()) {
        const flow = await oauth2Service.resolveScalarOAuthFlow(providerKey);

        authorizations.push({
          name: capitalizeProvider(providerKey),
          config: {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: flow.authorizationUrl,
                tokenUrl: `${hostAddress}/oauth2/scalar-token`,
                refreshUrl,
                'x-tokenName': ACCESS_TOKEN_FIELD,
                'x-usePkce': 'no',
                'x-scalar-redirect-uri': flow.redirectUri,
                'x-scalar-security-body': {
                  audience: 'code',
                  provider: providerKey,
                },
                ...(isDevelop
                  ? {
                      'x-scalar-client-id': flow.clientId,
                      clientSecret: flow.clientSecret,
                    }
                  : {}),
              },
            },
          },
        });
      }
    }
  }

  return authorizations;
}

export async function defineDocumentation(app: INestApplication) {
  const authorizations = await buildDocAuthorizations(app);

  const documentBuilder = new DocumentBuilder()
    .setTitle(packageJson.name)
    .setVersion(packageJson.version);

  for (const authorization of authorizations) {
    documentBuilder.addBearerAuth(
      authorization.config as never,
      authorization.name,
    );
    documentBuilder.addSecurityRequirements(authorization.name);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  if (authorizations.length > 0) {
    syncIsPublicRoutesInOpenApi(document);
    applyAuthSecurityToProtectedRoutes(
      document,
      authorizations.map((authorization) => authorization.name),
    );
  }

  SwaggerModule.setup(DOC_ENDPOINT, app, document, { swaggerUiEnabled: false });

  app.use(
    DOC_ENDPOINT,
    apiReference({
      darkMode: true,
      spec: { content: document },
      metaData: {
        title: packageJson.name,
        version: packageJson.version,
      },
      hideModels: true,
      hideDownloadButton: true,
      hideClientButton: true,
      hiddenClients: [
        'libcurl',
        'clj_http',
        'restsharp',
        'native',
        'http1.1',
        'asynchttp',
        'nethttp',
        'okhttp',
        'unirest',
        'xhr',
        'request',
        'nsurlsession',
        'cohttp',
        'guzzle',
        'http1',
        'http2',
        'webrequest',
        'restmethod',
        'requests',
        'httr',
        'httpie',
        'wget',
        'undici',
      ],
    }),
  );
}
