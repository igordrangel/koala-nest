import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  API_KEY_INSTALL_PATHS,
  API_KEY_SUBNET_PATH,
  JWT_ONLY_REMOVE_PATHS,
  OAUTH2_INSTALL_PATHS,
  OAUTH2_ONLY_REMOVE_PATHS,
} from '@cli/constants/auth-strategy-artifacts';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';
import { assertAuthStrategyProject } from './auth-strategy-validation';
import { removeImportLines } from './project-files';

function projectPath(projectName: string, relativePath: string) {
  return path.join(resolveProjectPath(projectName), relativePath);
}

function sourcePath(relativePath: string) {
  return path.join(getSourceCodePath(), relativePath);
}

function removePaths(projectName: string, paths: readonly string[]) {
  for (const relativePath of paths) {
    rmSync(projectPath(projectName, relativePath), {
      recursive: true,
      force: true,
    });
  }
}

function installPath(projectName: string, relativePath: string) {
  const from = sourcePath(relativePath);
  const to = projectPath(projectName, relativePath);

  if (!existsSync(from)) {
    return;
  }

  mkdirSync(path.dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true, force: true });
}

function readProject(projectName: string, relativePath: string) {
  return readFileSync(projectPath(projectName, relativePath), 'utf8');
}

function writeProject(projectName: string, relativePath: string, content: string) {
  const target = projectPath(projectName, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, content);
}

const AUTHORIZATION_WITHOUT_SUBNET = `import { EnvConfig } from '@/core/utils/env.config';
import {
  matchApiKeyDomainOrigin,
  resolveClientIp,
} from '@/core/utils/match-api-key-domain-origin';
import { ApiKeyType } from '@/domain/entities/api-key/enums/api-key-type.enum';
import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyAuthorizationService {
  constructor(private readonly apiKeyRepository: IApiKeyRepository) {}

  private async validateDomainOrigin(
    origins: string[],
    req: Request,
  ): Promise<boolean> {
    const clientIp = resolveClientIp(req);

    if (!clientIp) {
      return false;
    }

    return matchApiKeyDomainOrigin(clientIp, origins);
  }

  async validateApiKey(
    userId: string,
    apiKeyId: string,
    req: Request,
  ): Promise<boolean> {
    const apiKey = await this.apiKeyRepository.findById(apiKeyId);

    if (!apiKey || apiKey.userId !== userId) {
      return false;
    }

    const origins = apiKey.origin.split(',').map((origin) => origin.trim());

    if (
      (EnvConfig.isEnvTest || EnvConfig.isEnvDevelop) &&
      origins.includes('*')
    ) {
      return true;
    }

    switch (apiKey.type) {
      case ApiKeyType.domain:
        return this.validateDomainOrigin(origins, req);
      case ApiKeyType.host:
        return origins.includes(req.hostname);
      case ApiKeyType.uri: {
        let uri = \`\${req.hostname}\${req.path}\`;

        for (const param of Object.values(req.params)) {
          if (typeof param === 'string' && param.length > 0) {
            uri = uri.replace(\`/\${param}\`, '');
          }
        }

        return origins.includes(uri);
      }
      default:
        return false;
    }
  }
}
`;

export function stripApiKeyFromAppModule(content: string) {
  let patched = removeImportLines(content, [
    './controllers/api-key/api-key.module',
  ]);
  patched = patched.replace(/\s*ApiKeyModule,\n/g, '\n');
  return patched;
}

export function stripApiKeyFromRepositoryModule(content: string) {
  let patched = removeImportLines(content, [
    '@/domain/repositories/iapi-key.repository',
    '@/infra/repositories/api-key.repository',
  ]);
  patched = patched.replace(
    /\s*\{ provide: IApiKeyRepository, useClass: ApiKeyRepository \},?\n/g,
    '\n',
  );
  patched = patched.replace(/\n\s*IApiKeyRepository,?/g, '');
  patched = patched.replace(/, IApiKeyRepository/g, '');
  patched = patched.replace(/IApiKeyRepository, /g, '');
  return patched;
}

export function stripApiKeyFromSecurityModule(content: string) {
  let patched = removeImportLines(content, [
    '@/infra/auth/api-key-authorization.service',
    './strategies/api-key.strategy',
  ]);
  patched = patched.replace(/\s*ApiKeyStrategy,\n/g, '\n');
  patched = patched.replace(/\s*ApiKeyAuthorizationService,\n/g, '\n');
  return patched;
}

export function stripApiKeyFromAuthGuard(content: string) {
  return content.replace(
    "NestAuthGuard(['jwt', 'apikey'])",
    "NestAuthGuard('jwt')",
  );
}

export function stripApiKeyFromMappingProvider(content: string) {
  let patched = removeImportLines(content, ['./api-key.mapper']);
  patched = patched.replace(/\s*ApiKeyMapper\.createMap\(\);\n/g, '\n');
  return patched;
}

export function syncApiKeyArtifactsForStrategies(
  projectName: string,
  strategies: readonly AuthStrategy[],
  options: { apiKeyInternalSubnet?: boolean } = {},
) {
  const hasApiKey = strategies.includes(AuthStrategy.API_KEY);
  const wantSubnet = options.apiKeyInternalSubnet === true;

  if (hasApiKey) {
    for (const relativePath of API_KEY_INSTALL_PATHS) {
      installPath(projectName, relativePath);
    }

    const mappingPath = 'src/application/mapping/mapping.provider.ts';
    if (existsSync(projectPath(projectName, mappingPath))) {
      let mapping = readProject(projectName, mappingPath);

      if (!mapping.includes('ApiKeyMapper')) {
        if (!mapping.includes("./api-key.mapper")) {
          mapping = mapping.replace(
            "import { PersonMapper } from './person.mapper';",
            "import { ApiKeyMapper } from './api-key.mapper';\nimport { PersonMapper } from './person.mapper';",
          );

          if (!mapping.includes("./api-key.mapper")) {
            mapping = mapping.replace(
              "import { Injectable } from '@nestjs/common';",
              "import { Injectable } from '@nestjs/common';\nimport { ApiKeyMapper } from './api-key.mapper';",
            );
          }
        }

        if (!mapping.includes('ApiKeyMapper.createMap()')) {
          mapping = mapping.replace(
            'PersonMapper.createMap();',
            'PersonMapper.createMap();\n    ApiKeyMapper.createMap();',
          );

          if (!mapping.includes('ApiKeyMapper.createMap()')) {
            mapping = mapping.replace(
              'constructor() {',
              'constructor() {\n    ApiKeyMapper.createMap();',
            );
          }
        }

        writeProject(projectName, mappingPath, mapping);
      }
    }

    if (wantSubnet) {
      installPath(projectName, API_KEY_SUBNET_PATH);
      installPath(
        projectName,
        'src/infra/auth/api-key-authorization.service.ts',
      );
    } else {
      removePaths(projectName, [API_KEY_SUBNET_PATH]);
      writeProject(
        projectName,
        'src/infra/auth/api-key-authorization.service.ts',
        AUTHORIZATION_WITHOUT_SUBNET,
      );
    }

    const repositoryPath = 'src/infra/repositories/repository.module.ts';
    if (existsSync(projectPath(projectName, repositoryPath))) {
      let repository = readProject(projectName, repositoryPath);

      if (!repository.includes('IApiKeyRepository')) {
        repository = repository.replace(
          "import { IUserRepository } from '@/domain/repositories/iuser.repository';",
          "import { IApiKeyRepository } from '@/domain/repositories/iapi-key.repository';\nimport { IUserRepository } from '@/domain/repositories/iuser.repository';",
        );
        repository = repository.replace(
          "import { UserRepository } from '@/infra/repositories/user.repository';",
          "import { ApiKeyRepository } from '@/infra/repositories/api-key.repository';\nimport { UserRepository } from '@/infra/repositories/user.repository';",
        );
        repository = repository.replace(
          '{ provide: IUserRepository, useClass: UserRepository },',
          '{ provide: IUserRepository, useClass: UserRepository },\n    { provide: IApiKeyRepository, useClass: ApiKeyRepository },',
        );
        repository = repository.replace(
          'exports: [DatabaseModule, IPersonRepository, IUserRepository]',
          'exports: [DatabaseModule, IPersonRepository, IUserRepository, IApiKeyRepository]',
        );
        repository = repository.replace(
          'exports: [DatabaseModule, IUserRepository]',
          'exports: [DatabaseModule, IUserRepository, IApiKeyRepository]',
        );

        if (
          repository.includes('IUserRepository') &&
          !repository.includes('IApiKeyRepository')
        ) {
          repository = repository.replace(
            'exports: [DatabaseModule, IUserRepository]',
            'exports: [DatabaseModule, IUserRepository, IApiKeyRepository]',
          );
        }

        writeProject(projectName, repositoryPath, repository);
      }
    }

    const appModulePath = 'src/host/app.module.ts';
    if (existsSync(projectPath(projectName, appModulePath))) {
      let appModule = readProject(projectName, appModulePath);

      if (!appModule.includes('ApiKeyModule')) {
        appModule = appModule.replace(
          "import { AuthModule } from './controllers/auth/auth.module';",
          "import { ApiKeyModule } from './controllers/api-key/api-key.module';\nimport { AuthModule } from './controllers/auth/auth.module';",
        );
        appModule = appModule.replace(
          'AuthModule,\n',
          'AuthModule,\n    ApiKeyModule,\n',
        );
        writeProject(projectName, appModulePath, appModule);
      }
    }

    const securityPath = 'src/host/security/security.module.ts';
    if (existsSync(projectPath(projectName, securityPath))) {
      let security = readProject(projectName, securityPath);

      if (!security.includes('ApiKeyStrategy')) {
        installPath(projectName, 'src/host/security/strategies/api-key.strategy.ts');
        security = readProject(projectName, securityPath);

        if (!security.includes('ApiKeyStrategy')) {
          security = security.replace(
            "import { JwtStrategy } from './strategies/jwt.strategy';",
            "import { ApiKeyAuthorizationService } from '@/infra/auth/api-key-authorization.service';\nimport { ApiKeyStrategy } from './strategies/api-key.strategy';\nimport { JwtStrategy } from './strategies/jwt.strategy';",
          );
          security = security.replace(
            'JwtStrategy,\n',
            'JwtStrategy,\n    ApiKeyStrategy,\n    ApiKeyAuthorizationService,\n',
          );
          writeProject(projectName, securityPath, security);
        }
      }
    }

    const guardPath = 'src/host/security/guards/auth.guard.ts';
    if (existsSync(projectPath(projectName, guardPath))) {
      const guard = readProject(projectName, guardPath);

      if (!guard.includes("'apikey'")) {
        writeProject(
          projectName,
          guardPath,
          guard.replace("NestAuthGuard('jwt')", "NestAuthGuard(['jwt', 'apikey'])"),
        );
      }
    }

    return;
  }

  removePaths(projectName, [...API_KEY_INSTALL_PATHS, API_KEY_SUBNET_PATH]);

  const appModulePath = 'src/host/app.module.ts';
  if (existsSync(projectPath(projectName, appModulePath))) {
    writeProject(
      projectName,
      appModulePath,
      stripApiKeyFromAppModule(readProject(projectName, appModulePath)),
    );
  }

  const repositoryPath = 'src/infra/repositories/repository.module.ts';
  if (existsSync(projectPath(projectName, repositoryPath))) {
    writeProject(
      projectName,
      repositoryPath,
      stripApiKeyFromRepositoryModule(readProject(projectName, repositoryPath)),
    );
  }

  const securityPath = 'src/host/security/security.module.ts';
  if (existsSync(projectPath(projectName, securityPath))) {
    writeProject(
      projectName,
      securityPath,
      stripApiKeyFromSecurityModule(readProject(projectName, securityPath)),
    );
  }

  const guardPath = 'src/host/security/guards/auth.guard.ts';
  if (existsSync(projectPath(projectName, guardPath))) {
    writeProject(
      projectName,
      guardPath,
      stripApiKeyFromAuthGuard(readProject(projectName, guardPath)),
    );
  }

  const mappingPath = 'src/application/mapping/mapping.provider.ts';
  if (existsSync(projectPath(projectName, mappingPath))) {
    writeProject(
      projectName,
      mappingPath,
      stripApiKeyFromMappingProvider(readProject(projectName, mappingPath)),
    );
  }
}

export function installAuthArtifactsForStrategies(
  projectName: string,
  strategies: readonly AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);

  if (hasJwt) {
    installPath(projectName, 'src/application/auth/login');
    installPath(projectName, 'src/host/controllers/auth/login.controller.ts');
    installPath(projectName, 'src/test/application/login.handler.spec.ts');
  }

  if (hasOauth) {
    for (const relativePath of OAUTH2_INSTALL_PATHS) {
      installPath(projectName, relativePath);
    }
  }
}

export function pruneAuthArtifactsForStrategies(
  projectName: string,
  strategies: readonly AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);

  if (hasJwt && !hasOauth) {
    removePaths(projectName, JWT_ONLY_REMOVE_PATHS);
  }

  if (hasOauth && !hasJwt) {
    removePaths(projectName, OAUTH2_ONLY_REMOVE_PATHS);
  }
}

export {
  assertAuthStrategyProject,
  listAuthStrategyViolations,
} from './auth-strategy-validation';

export function assertAuthStrategyPaths(
  projectName: string,
  strategies: readonly AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
  const hasApiKey = strategies.includes(AuthStrategy.API_KEY);
  const root = resolveProjectPath(projectName);

  const expectations = [
    {
      path: 'src/host/controllers/auth/login.controller.ts',
      shouldExist: hasJwt,
    },
    {
      path: 'src/host/controllers/oauth2/auth-link.controller.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/application/auth/login/login.handler.ts',
      shouldExist: hasJwt,
    },
    {
      path: 'src/application/auth/oauth2/auth-link/auth-link.handler.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/domain/auth/dtos/oauth-user-info.dto.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/infra/auth/oauth2-auth.service.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/core/auth/parse-oauth2-provider-env.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/core/auth/oauth-provider.registry.ts',
      shouldExist: hasOauth,
    },
    {
      path: 'src/host/controllers/api-key/api-key.module.ts',
      shouldExist: hasApiKey,
    },
    {
      path: 'src/host/security/strategies/api-key.strategy.ts',
      shouldExist: hasApiKey,
    },
  ];

  const iauthServicePath = path.join(
    root,
    'src/domain/auth/services/iauth.service.ts',
  );

  if (existsSync(iauthServicePath)) {
    const iauthService = readFileSync(iauthServicePath, 'utf8');
    const hasOAuthInterface = iauthService.includes('IOAuth2Service');
    const hasJwtInterface = iauthService.includes('IJwtTokenService');

    if (hasJwt && !hasOauth && (hasOAuthInterface || !hasJwtInterface)) {
      throw new Error(
        'Esperado iauth.service.ts apenas com IJwtTokenService no modo JWT',
      );
    }

    if (hasOauth && !hasOAuthInterface) {
      throw new Error(
        'Esperado iauth.service.ts conter IOAuth2Service quando OAuth2 está ativo',
      );
    }
  }

  for (const { path: relativePath, shouldExist } of expectations) {
    const exists = existsSync(path.join(root, relativePath));

    if (exists !== shouldExist) {
      throw new Error(
        `Esperado ${shouldExist ? 'existir' : 'não existir'}: ${relativePath}`,
      );
    }
  }
}
