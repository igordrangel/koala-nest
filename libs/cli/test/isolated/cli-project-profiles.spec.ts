import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildProjectExpectation,
  CLI_NEW_SELECTION_MATRIX,
  requiredPackagesForExpectation,
} from '@cli/constants/cli-project-checklist';
import { Template, resolveNewProjectOptions } from '@cli/constants/domain';
import { applyOptionalFeatures } from '@cli/utils/apply-optional-features.ts';
import { assertCliProjectFromSelection } from '@cli/utils/cli-project-validation.ts';
import { installModule, Modules } from '@cli/utils/install-module.ts';

mock.module('@cli/utils/run-command.ts', () => ({
  runCommand: async () => {},
}));

mock.module('@cli/utils/format-code.ts', () => ({
  formatCode: async () => {},
}));

function seedProjectMetadata(
  projectRoot: string,
  expectation: ReturnType<typeof buildProjectExpectation>,
) {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    name: string;
    packageManager: string;
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
  };

  packageJson.scripts ??= {};
  packageJson.scripts['start:prod'] = 'node dist/host/main';
  packageJson.dependencies ??= {};

  for (const dependency of requiredPackagesForExpectation(expectation)) {
    packageJson.dependencies[dependency] ??= '0.0.0-test';
  }

  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  writeFileSync(
    path.join(projectRoot, 'nest-cli.json'),
    `${JSON.stringify({ entryFile: 'host/main' }, null, 2)}\n`,
  );
}

describe('CLI project profiles via installModule + applyOptionalFeatures', () => {
  let tempDir = '';

  beforeEach(() => {
    tempDir = mkdtempSync(path.join(os.tmpdir(), 'koala-cli-profile-'));
    writeFileSync(
      path.join(tempDir, 'package.json'),
      `${JSON.stringify({ name: 'cli-profile', packageManager: 'bun' }, null, 2)}\n`,
    );
  });

  afterEach(() => {
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = '';
    }
  });

  for (const selection of CLI_NEW_SELECTION_MATRIX) {
    it(`checklist completo: ${selection.label}`, async () => {
      await installModule(Modules.CORE, selection.template, tempDir, {
        skipPackages: true,
      });

      const resolved = resolveNewProjectOptions(
        selection.template,
        [...selection.auth],
        [...selection.features],
      );

      await applyOptionalFeatures({
        projectName: tempDir,
        template: selection.template,
        auth: resolved.auth,
        features: resolved.features,
        skipPackages: true,
      });

      const expectation = buildProjectExpectation(
        selection.template,
        selection.auth,
        selection.features,
      );
      seedProjectMetadata(tempDir, expectation);

      if (selection.template === Template.DEFAULT) {
        expect(
          existsSync(
            path.join(tempDir, 'src/host/controllers/person/person.module.ts'),
          ),
        ).toBe(false);
      } else {
        expect(
          existsSync(
            path.join(tempDir, 'src/host/controllers/person/person.module.ts'),
          ),
        ).toBe(true);
      }

      assertCliProjectFromSelection(
        tempDir,
        selection.template,
        selection.auth,
        selection.features,
      );
    });
  }
});
