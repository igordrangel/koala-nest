// @ts-check
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cliRoot = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(cliRoot, '../koala-nest/package.json'));

const eslint = require('@eslint/js');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');
const tseslint = require('typescript-eslint');

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: globals.node,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: cliRoot,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          endOfLine: 'auto',
        },
      ],
    },
  },
);
