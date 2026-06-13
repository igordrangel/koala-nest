import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { formatCode } from './format-code';
import { resolveProjectPath } from './resolve-project-pach';

export type AuthStrategy = 'jwt' | 'oauth2';

async function patchFile(
  projectName: string,
  relativePath: string,
  replacers: Array<{ from: string; to: string }>,
) {
  const filePath = path.join(resolveProjectPath(projectName), relativePath);
  let content = readFileSync(filePath, 'utf8');

  for (const { from, to } of replacers) {
    content = content.replace(from, to);
  }

  writeFileSync(filePath, await formatCode(content));
}

export async function patchAuthInstall(
  projectName: string,
  strategy: AuthStrategy,
) {
  await patchFile(projectName, 'src/host/app.module.ts', [
    {
      from: "import { PersonModule } from './controllers/person/person.module';",
      to: "import { PersonModule } from './controllers/person/person.module';\nimport { AuthModule } from './controllers/auth/auth.module';\nimport { SecurityModule } from './security/security.module';",
    },
    {
      from: '    PersonModule,',
      to: '    SecurityModule,\n    AuthModule,\n    PersonModule,',
    },
  ]);

  await patchFile(projectName, 'src/host/main.ts', [
    {
      from: "import { HttpAdapterHost } from '@nestjs/core';",
      to: "import { HttpAdapterHost } from '@nestjs/core';\nimport { AuthGuard } from './security/guards/auth.guard';\nimport { ProfilesGuard } from './security/guards/profiles.guard';",
    },
    {
      from: '  await bootstrapKoalaJobs(app, {',
      to: '  app.useGlobalGuards(\n    await app.resolve(AuthGuard),\n    await app.resolve(ProfilesGuard),\n  );\n\n  await bootstrapKoalaJobs(app, {',
    },
  ]);

  await patchFile(projectName, 'src/host/open-api/define-documentation.ts', [
    {
      from: 'export function defineDocumentation(app: INestApplication) {',
      to: 'export async function defineDocumentation(app: INestApplication) {',
    },
  ]);

  if (strategy === 'jwt') {
    await patchFile(projectName, 'src/host/controllers/auth/auth.module.ts', [
      {
        from: "import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';\nimport { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';\nimport { ScalarOAuthTokenHandler } from '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler';",
        to: '',
      },
      {
        from: "import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';\nimport { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';\nimport { ScalarOAuthTokenController } from '../oauth2/scalar-token.controller';",
        to: '',
      },
      {
        from: '    OAuthAuthLinkController,\n    OAuthExchangeCodeController,\n    ScalarOAuthTokenController,',
        to: '',
      },
      {
        from: '    OAuthAuthLinkHandler,\n    OAuthExchangeCodeHandler,\n    ScalarOAuthTokenHandler,',
        to: '',
      },
    ]);
  }
}
