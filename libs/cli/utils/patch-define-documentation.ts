import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
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
