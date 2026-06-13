import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';

const defineDocumentationWithoutAuth = `import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import packageJson from '../../../package.json';

const DOC_ENDPOINT = '/doc';

export async function defineDocumentation(app: INestApplication) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(packageJson.name)
      .setVersion(packageJson.version)
      .build(),
  );

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
`;

export function stripDefineDocumentationAuth(projectName: string) {
  const targetPath = path.join(
    resolveProjectPath(projectName),
    'src/host/open-api/define-documentation.ts',
  );

  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, defineDocumentationWithoutAuth, 'utf8');
}

export function restoreDefineDocumentationWithAuth(projectName: string) {
  cpSync(
    path.join(getSourceCodePath(), 'src/host/open-api/define-documentation.ts'),
    path.join(
      resolveProjectPath(projectName),
      'src/host/open-api/define-documentation.ts',
    ),
    { force: true },
  );
}

const defineDocumentationJwtOnly = `import { EnvConfig } from '@/core/utils/env.config';
import { isProviderRegistered } from '@/core/utils/is-provider-registered';
import { resolveApiHost } from '@/core/utils/resolve-api-host';
import { IJwtTokenService } from '@/domain/auth/services/iauth.service';
import {
  applyAuthSecurityToProtectedRoutes,
  syncIsPublicRoutesInOpenApi,
} from '@/host/decorators/is-public.decorator';
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

async function buildDocAuthorizations(
  app: INestApplication,
): Promise<DocAuthorization[]> {
  if (!isProviderRegistered(app, IJwtTokenService)) {
    return [];
  }

  const env = app.get(EnvService);
  const hostAddress = resolveApiHost(env.get('API_HOST'), env.get('PORT'));
  const isDevelop = EnvConfig.isEnvDevelop;
  const refreshUrl = \`\${hostAddress}/auth/refresh\`;
  const authorizations: DocAuthorization[] = [];

  if (hasController(app, 'LoginController')) {
    authorizations.push({
      name: 'JWT',
      config: {
        type: 'oauth2',
        flows: {
          password: {
            tokenUrl: \`\${hostAddress}/auth/login\`,
            refreshUrl,
            username: isDevelop ? 'admin@example.com' : '',
            password: isDevelop ? 'admin123' : '',
            'x-tokenName': ACCESS_TOKEN_FIELD,
          },
        },
      },
    });
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
`;

export function syncDefineDocumentationForProject(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
  const targetPath = path.join(
    resolveProjectPath(projectName),
    'src/host/open-api/define-documentation.ts',
  );

  mkdirSync(path.dirname(targetPath), { recursive: true });

  if (hasJwt && !hasOauth) {
    writeFileSync(targetPath, defineDocumentationJwtOnly);
    return;
  }

  restoreDefineDocumentationWithAuth(projectName);
}
