import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { patchAppModuleForAuth } from './patch-main';
import { resolveProjectPath } from './resolve-project-path';

export type AuthStrategy = 'jwt' | 'oauth2';

function patchFile(
  projectName: string,
  relativePath: string,
  replacers: Array<{ from: string; to: string }>,
) {
  const filePath = path.join(resolveProjectPath(projectName), relativePath);
  let content = readFileSync(filePath, 'utf8');

  for (const { from, to } of replacers) {
    if (content.includes(from)) {
      content = content.replace(from, to);
    }
  }

  writeFileSync(filePath, content);
}

export function patchAppModuleForAuth(content: string) {
  if (content.includes("import { SecurityModule }")) {
    return content;
  }

  let patched = content.replace(
    "import { Module } from '@nestjs/common';",
    "import { Module } from '@nestjs/common';\nimport { AuthModule } from './controllers/auth/auth.module';\nimport { SecurityModule } from './security/security.module';",
  );

  if (patched.includes('PersonModule,')) {
    return patched.replace(
      '    PersonModule,',
      '    SecurityModule,\n    AuthModule,\n    PersonModule,',
    );
  }

  return patched.replace(
    /(ConfigModule\.forRoot\(\{[\s\S]*?\}\),)\n/,
    '$1\n    SecurityModule,\n    AuthModule,\n',
  );
}

export async function patchAuthInstall(
  projectName: string,
  strategy: AuthStrategy,
) {
  const appModulePath = path.join(
    resolveProjectPath(projectName),
    'src/host/app.module.ts',
  );

  writeFileSync(
    appModulePath,
    patchAppModuleForAuth(readFileSync(appModulePath, 'utf8')),
  );

  const mainPath = path.join(resolveProjectPath(projectName), 'src/host/main.ts');
  writeFileSync(mainPath, patchMainForAuth(readFileSync(mainPath, 'utf8')));

  patchFile(projectName, 'src/host/main.ts', [
    {
      from: "import { HttpAdapterHost } from '@nestjs/core';",
      to: "import { HttpAdapterHost } from '@nestjs/core';\nimport { AuthGuard } from './security/guards/auth.guard';\nimport { ProfilesGuard } from './security/guards/profiles.guard';",
    },
    {
      from: '  await app.listen',
      to: '  app.useGlobalGuards(\n    await app.resolve(AuthGuard),\n    await app.resolve(ProfilesGuard),\n  );\n\n  await app.listen',
    },
  ]);

  if (strategy === 'jwt') {
    patchFile(projectName, 'src/host/controllers/auth/auth.module.ts', [
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
