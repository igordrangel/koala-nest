import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  JWT_ONLY_REMOVE_PATHS,
  OAUTH2_INSTALL_PATHS,
  OAUTH2_ONLY_REMOVE_PATHS,
} from '@cli/constants/auth-strategy-artifacts';
import { AuthStrategy } from '@cli/constants/domain';
import { getSourceCodePath } from './get-source-code-path';
import { resolveProjectPath } from './resolve-project-path';
import { assertAuthStrategyProject } from './auth-strategy-validation';

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

export { assertAuthStrategyProject, listAuthStrategyViolations } from './auth-strategy-validation';

export function assertAuthStrategyPaths(
  projectName: string,
  strategies: readonly AuthStrategy[],
) {
  const hasJwt = strategies.includes(AuthStrategy.JWT);
  const hasOauth = strategies.includes(AuthStrategy.OAUTH2);
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
