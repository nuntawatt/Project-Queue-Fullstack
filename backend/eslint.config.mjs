/// <reference types="node" />
// @ts-check

import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import url from 'url';
import path from 'path';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'eslint.config.mjs',
    ],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,

  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },

      sourceType: 'module',

      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',

      '@typescript-eslint/no-unsafe-call': 'warn',

      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
);