import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import packageJson from '../../../package.json';
import { apiReference } from '@scalar/nestjs-api-reference';

export function defineDocumentation(app: INestApplication) {
  const documentBuilder = new DocumentBuilder()
    .setTitle('KoalaNest')
    .setDescription('KoalaNest API')
    .setVersion(packageJson.version)
    .build();

  const document = SwaggerModule.createDocument(app, documentBuilder);
  const docEndpoint = '/doc';

  SwaggerModule.setup(docEndpoint, app, document, { swaggerUiEnabled: false });

  app.use(
    docEndpoint,
    apiReference({
      spec: { content: document },
      metaData: {
        title: documentBuilder.info.title,
        description: documentBuilder.info.description,
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
        'okhttp',
        'native',
        'request',
        'unirest',
        'nsurlsession',
        'cohttp',
        'guzzle',
        'http1',
        'http2',
        'webrequest',
        'restmethod',
        'requests',
        'httr',
        'native',
        'httpie',
        'wget',
        'nsurlsession',
        'undici',
      ],
    }),
  );
}
