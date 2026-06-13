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
      from: '  const koalaApp = bootstrapKoalaApp(app);\n  await koalaApp.build();',
      to: '  const koalaApp = bootstrapKoalaApp(app);\n  await koalaApp\n    .addGlobalGuard(AuthGuard)\n    .addGlobalGuard(ProfilesGuard)\n    .build();',
    },
  ]);

  if (strategy === 'jwt') {
    await patchFile(projectName, 'src/host/controllers/auth/auth.module.ts', [
      {
        from: "import { OAuthAuthLinkHandler } from '@/application/auth/oauth2/auth-link/auth-link.handler';\nimport { OAuthExchangeCodeHandler } from '@/application/auth/oauth2/exchange-code/exchange-code.handler';",
        to: '',
      },
      {
        from: "import { OAuthAuthLinkController } from '../oauth2/auth-link.controller';\nimport { OAuthExchangeCodeController } from '../oauth2/exchange-code.controller';",
        to: '',
      },
      {
        from: '    OAuthAuthLinkController,\n    OAuthExchangeCodeController,',
        to: '',
      },
      {
        from: '    OAuthAuthLinkHandler,\n    OAuthExchangeCodeHandler,',
        to: '',
      },
    ]);
  }

  await patchFile(projectName, 'src/host/open-api/define-documentation.ts', [
    {
      from: '.setVersion(packageJson.version)',
      to: '.setVersion(packageJson.version)\n    .addBearerAuth()',
    },
  ]);
}
