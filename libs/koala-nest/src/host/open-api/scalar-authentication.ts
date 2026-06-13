import { OpenApiDoc } from './open-api.constants';
import { AuthProfile } from '@/core/auth/auth-profile.enum';
import { EnvConfig } from '@/core/utils/env.config';
import { OAuthProviderRegistry } from '@/core/auth/oauth-provider.registry';
import {
  IJwtTokenService,
  IOAuth2Service,
} from '@/domain/auth/services/iauth.service';
import { EnvService } from '@/infra/common/env.service';
import { INestApplication } from '@nestjs/common';
import { isProviderRegistered } from '@/core/utils/is-provider-registered';
import { resolveApiHost } from '@/core/utils/resolve-api-host';
import { OpenAPIObject } from '@nestjs/swagger';
import type { AuthenticationConfiguration } from '@scalar/types';

export type ScalarAuthenticationSetup = {
  openApiSecuritySchemes: NonNullable<
    OpenAPIObject['components']
  >['securitySchemes'];
  authentication: AuthenticationConfiguration;
  persistAuth: boolean;
};

function capitalizeProvider(key: string) {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

type OpenApiSecurityScheme = NonNullable<
  NonNullable<OpenAPIObject['components']>['securitySchemes']
>[string];

export async function buildScalarAuthentication(
  app: INestApplication,
): Promise<ScalarAuthenticationSetup | undefined> {
  if (!isProviderRegistered(app, IJwtTokenService)) {
    return undefined;
  }

  const env = app.get(EnvService);
  const hostAddress = resolveApiHost(env.get('API_HOST'), env.get('PORT'));
  const isDevelop = EnvConfig.isEnvDevelop;
  const openApiSecuritySchemes: NonNullable<
    OpenAPIObject['components']
  >['securitySchemes'] = {};
  const securitySchemes: NonNullable<
    AuthenticationConfiguration['securitySchemes']
  > = {};
  const preferredSecurityScheme: string[] = [];

  const jwtSchemeName = OpenApiDoc.JWT_SCHEME;
  const jwtTokenUrl = `${hostAddress}/auth/scalar-token`;
  const defaultSub = 'scalar-dev-user';
  const defaultProfile = AuthProfile.admin;

  openApiSecuritySchemes[jwtSchemeName] = {
    type: 'oauth2',
    flows: {
      password: {
        tokenUrl: jwtTokenUrl,
        scopes: {},
        'x-tokenName': OpenApiDoc.ACCESS_TOKEN_FIELD,
      },
    },
  } as OpenApiSecurityScheme;

  securitySchemes[jwtSchemeName] = {
    flows: {
      password: {
        tokenUrl: jwtTokenUrl,
        username: isDevelop ? defaultSub : '',
        password: isDevelop ? defaultProfile : '',
        'x-tokenName': OpenApiDoc.ACCESS_TOKEN_FIELD,
      },
    },
  };

  preferredSecurityScheme.push(jwtSchemeName);

  const oauth2Service = isProviderRegistered(app, IOAuth2Service)
    ? app.get(IOAuth2Service)
    : undefined;
  const providerRegistry = isProviderRegistered(app, OAuthProviderRegistry)
    ? app.get(OAuthProviderRegistry)
    : undefined;

  if (oauth2Service && providerRegistry) {
    for (const providerKey of providerRegistry.listProviders()) {
      const config = await oauth2Service.providerConfig(providerKey);
      const authorizationUrl = `${hostAddress}/oauth2/auth-link/redirect?provider=${encodeURIComponent(providerKey)}`;
      const schemeName = capitalizeProvider(providerKey);
      const tokenUrl = `${hostAddress}/oauth2/scalar-token`;

      openApiSecuritySchemes[schemeName] = {
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl,
            tokenUrl,
            scopes: {},
            'x-tokenName': OpenApiDoc.ACCESS_TOKEN_FIELD,
            'x-scalar-redirect-uri': config.redirectUri,
            'x-scalar-security-body': {
              provider: providerKey,
            },
            ...(isDevelop
              ? {
                  'x-scalar-client-id': config.clientId,
                  clientSecret: config.clientSecret,
                }
              : {}),
          },
        },
      } as OpenApiSecurityScheme;

      securitySchemes[schemeName] = {
        flows: {
          authorizationCode: {
            tokenUrl,
            'x-scalar-client-id': isDevelop ? config.clientId : '',
            clientSecret: isDevelop ? config.clientSecret : '',
            'x-scalar-redirect-uri': config.redirectUri,
            'x-scalar-security-body': {
              provider: providerKey,
            },
            'x-tokenName': OpenApiDoc.ACCESS_TOKEN_FIELD,
          },
        },
      };

      preferredSecurityScheme.push(schemeName);
    }
  }

  return {
    openApiSecuritySchemes,
    authentication: {
      preferredSecurityScheme,
      securitySchemes,
    },
    persistAuth: isDevelop,
  };
}
