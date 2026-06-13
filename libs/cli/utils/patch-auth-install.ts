import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { patchMainForAuth } from './patch-main';
import { removeImportLines } from './project-files';
import { resolveProjectPath } from './resolve-project-path';
import { patchEnvForAuthStrategies } from './patch-env';
import { syncDefineDocumentationForProject } from './patch-define-documentation';
import { syncAuthStrategySupportFiles } from './sync-auth-strategy-files';
import {
  installAuthArtifactsForStrategies,
  pruneAuthArtifactsForStrategies,
} from './prune-auth-strategies';

export type { AuthStrategy } from '@cli/constants/domain';

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
  if (content.includes('import { SecurityModule }')) {
    return content;
  }

  const patched = content.replace(
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

export function patchRepositoryForAuth(content: string) {
  if (content.includes('IUserRepository')) {
    return content;
  }

  let patched = content.replace(
    "import { Module } from '@nestjs/common';",
    "import { IUserRepository } from '@/domain/repositories/iuser.repository';\nimport { Module } from '@nestjs/common';",
  );

  patched = patched.replace(
    "import { DatabaseModule } from '@/infra/database/database.module';",
    "import { DatabaseModule } from '@/infra/database/database.module';\nimport { UserRepository } from '@/infra/repositories/user.repository';",
  );

  if (patched.includes('providers: [')) {
    patched = patched.replace(
      'providers: [',
      'providers: [\n    { provide: IUserRepository, useClass: UserRepository },',
    );
  } else {
    patched = patched.replace(
      'imports: [DatabaseModule],',
      'imports: [DatabaseModule],\n  providers: [{ provide: IUserRepository, useClass: UserRepository }],',
    );
  }

  if (patched.includes('exports: [DatabaseModule]')) {
    patched = patched.replace(
      'exports: [DatabaseModule]',
      'exports: [DatabaseModule, IUserRepository]',
    );
  } else {
    patched = patched.replace(
      'exports: [DatabaseModule,',
      'exports: [DatabaseModule, IUserRepository,',
    );
  }

  return patched;
}

export function patchDataSourceForAuth(content: string) {
  if (content.includes('@/domain/entities/user/user')) {
    return content;
  }

  return content
    .replace(
      "import { EnvService } from '@/infra/common/env.service';",
      "import { User } from '@/domain/entities/user/user';\nimport { EnvService } from '@/infra/common/env.service';",
    )
    .replace(/entities: \[([^\]]*)\],/, (match, entities) => {
      const trimmed = entities.trim();

      if (!trimmed) {
        return 'entities: [User],';
      }

      if (trimmed.includes('User')) {
        return match;
      }

      return `entities: [${trimmed}, User],`;
    });
}

const JWT_OAUTH_IMPORTS = [
  '@/application/auth/oauth2/auth-link/auth-link.handler',
  '@/application/auth/oauth2/exchange-code/exchange-code.handler',
  '@/application/auth/oauth2/scalar-token/scalar-oauth-token.handler',
  '../oauth2/auth-link.controller',
  '../oauth2/exchange-code.controller',
  '../oauth2/oauth-callback.controller',
  '../oauth2/scalar-token.controller',
];

const JWT_OAUTH_SYMBOLS = [
  'OAuthAuthLinkController',
  'OAuthExchangeCodeController',
  'OAuthCallbackController',
  'ScalarOAuthTokenController',
  'OAuthAuthLinkHandler',
  'OAuthExchangeCodeHandler',
  'ScalarOAuthTokenHandler',
];

export function patchAuthModuleForJwt(content: string) {
  let patched = removeImportLines(content, JWT_OAUTH_IMPORTS);

  for (const symbol of JWT_OAUTH_SYMBOLS) {
    patched = patched.replace(new RegExp(`\\s*${symbol},\\n`, 'g'), '');
  }

  return patched;
}

const JWT_LOGIN_IMPORTS = [
  '@/application/auth/login/login.handler',
  './login.controller',
];

const JWT_LOGIN_SYMBOLS = ['LoginController', 'LoginHandler'];

export function patchAuthModuleForOAuth2(content: string) {
  let patched = removeImportLines(content, JWT_LOGIN_IMPORTS);

  for (const symbol of JWT_LOGIN_SYMBOLS) {
    patched = patched.replace(new RegExp(`\\s*${symbol},\\n`, 'g'), '');
  }

  return patched;
}

export function applyAuthModuleStrategies(
  content: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);

  if (hasJwt && hasOauth) {
    return content;
  }

  if (hasJwt) {
    return patchAuthModuleForJwt(content);
  }

  if (hasOauth) {
    return patchAuthModuleForOAuth2(content);
  }

  return content;
}

export function syncAuthModuleForProject(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const authModulePath = path.join(
    resolveProjectPath(projectName),
    'src/host/controllers/auth/auth.module.ts',
  );

  cpSync(
    path.join(getSourceCodePath(), 'src/host/controllers/auth/auth.module.ts'),
    authModulePath,
    { force: true },
  );

  writeFileSync(
    authModulePath,
    applyAuthModuleStrategies(
      readFileSync(authModulePath, 'utf8'),
      strategies,
    ),
  );
}

const domainAuthServiceJwtOnly = `import { JwtClaims } from '@/core/auth/jwt-claims';

export abstract class IJwtTokenService {
  abstract signAccessToken(claims: JwtClaims): string;
  abstract signRefreshToken(claims: JwtClaims): string;
  abstract signTokenPair(claims: JwtClaims): {
    accessToken: string;
    access_token: string;
    refreshToken: string;
    refresh_token: string;
  };
}
`;

export function syncDomainAuthServiceForProject(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
  const servicePath = path.join(
    resolveProjectPath(projectName),
    'src/domain/auth/services/iauth.service.ts',
  );

  mkdirSync(path.dirname(servicePath), { recursive: true });

  if (hasJwt && !hasOauth) {
    writeFileSync(servicePath, domainAuthServiceJwtOnly);
    return;
  }

  cpSync(
    path.join(
      getSourceCodePath(),
      'src/domain/auth/services/iauth.service.ts',
    ),
    servicePath,
    { force: true },
  );
}

const SECURITY_OAUTH_IMPORTS = [
  '@/core/auth/oauth-provider.registry',
  '@/infra/auth/oauth2-auth.service',
];

const SECURITY_OAUTH_SYMBOLS = ['OAuthProviderRegistry', 'IOAuth2Service'];

export function patchSecurityModuleForJwt(content: string) {
  let patched = removeImportLines(content, SECURITY_OAUTH_IMPORTS);

  patched = patched.replace(
    /import \{\n  IJwtTokenService,\n  IOAuth2Service,\n\} from '@\/domain\/auth\/services\/iauth.service';/,
    "import { IJwtTokenService } from '@/domain/auth/services/iauth.service';",
  );

  patched = patched.replace(
    /\s*\{ provide: IOAuth2Service, useClass: OAuth2AuthService \},\n/g,
    '',
  );

  for (const symbol of SECURITY_OAUTH_SYMBOLS) {
    patched = patched.replace(new RegExp(`\\s*${symbol},\\s*\\n`, 'g'), '');
    patched = patched.replace(new RegExp(`\\s*${symbol},`, 'g'), '');
  }

  return patched;
}

export function syncSecurityModuleForProject(
  projectName: string,
  strategies: AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
  const securityModulePath = path.join(
    resolveProjectPath(projectName),
    'src/host/security/security.module.ts',
  );

  cpSync(
    path.join(getSourceCodePath(), 'src/host/security/security.module.ts'),
    securityModulePath,
    { force: true },
  );

  if (hasJwt && !hasOauth) {
    writeFileSync(
      securityModulePath,
      patchSecurityModuleForJwt(readFileSync(securityModulePath, 'utf8')),
    );
  }
}

export async function patchAuthInstall(
  projectName: string,
  strategies: AuthStrategy[],
) {
  if (strategies.length === 0) {
    throw new Error('Informe ao menos uma estratégia de autenticação.');
  }

  installAuthArtifactsForStrategies(projectName, strategies);

  const projectRoot = resolveProjectPath(projectName);
  const appModulePath = path.join(projectRoot, 'src/host/app.module.ts');
  const appModule = readFileSync(appModulePath, 'utf8');
  const hasSecurityModule = appModule.includes('SecurityModule');

  if (!hasSecurityModule) {
    writeFileSync(appModulePath, patchAppModuleForAuth(appModule));

    writeFileSync(
      path.join(projectRoot, 'src/infra/repositories/repository.module.ts'),
      patchRepositoryForAuth(
        readFileSync(
          path.join(projectRoot, 'src/infra/repositories/repository.module.ts'),
          'utf8',
        ),
      ),
    );

    writeFileSync(
      path.join(projectRoot, 'src/infra/database/data-source-factory.ts'),
      patchDataSourceForAuth(
        readFileSync(
          path.join(projectRoot, 'src/infra/database/data-source-factory.ts'),
          'utf8',
        ),
      ),
    );

    const mainPath = path.join(projectRoot, 'src/host/main.ts');
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
  }

  syncAuthModuleForProject(projectName, strategies);
  syncDomainAuthServiceForProject(projectName, strategies);
  syncSecurityModuleForProject(projectName, strategies);
  syncDefineDocumentationForProject(projectName, strategies);
  syncAuthStrategySupportFiles(projectName, strategies);
  pruneAuthArtifactsForStrategies(projectName, strategies);
  patchEnvForAuthStrategies(projectName, strategies);
}
