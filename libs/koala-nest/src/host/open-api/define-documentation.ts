import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../../../package.json';
import { apiReference } from '@scalar/nestjs-api-reference';
import { buildScalarAuthentication } from './scalar-authentication';
import { scalarThemeOptions } from './scalar-theme';
import {
  applyOpenApiBearerSecurity,
  markPublicRoutesInOpenApiDocument,
} from './apply-open-api-security';

export async function defineDocumentation(app: INestApplication) {
  const scalarAuth = await buildScalarAuthentication(app);

  const documentBuilder = new DocumentBuilder()
    .setTitle('KoalaNest')
    .setDescription('KoalaNest API')
    .setVersion(packageJson.version);

  if (scalarAuth) {
    documentBuilder.addBearerAuth().addSecurityRequirements('bearer');
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  const docEndpoint = '/doc';

  if (scalarAuth) {
    applyOpenApiBearerSecurity(document);
    markPublicRoutesInOpenApiDocument(document, app);

    document.components ??= {};
    document.components.securitySchemes = {
      ...document.components.securitySchemes,
      ...scalarAuth.openApiSecuritySchemes,
    };
  }

  SwaggerModule.setup(docEndpoint, app, document, { swaggerUiEnabled: false });

  app.use(
    docEndpoint,
    apiReference({
      ...scalarThemeOptions,
      spec: { content: document },
      metaData: {
        title: 'KoalaNest',
        description: 'KoalaNest API',
        version: packageJson.version,
      },
      persistAuth: scalarAuth?.persistAuth ?? false,
      authentication: scalarAuth?.authentication,
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
