import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import reactCompiler from 'eslint-plugin-react-compiler'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import testingLibrary from 'eslint-plugin-testing-library'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['dist', 'coverage'],
  },
  js.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-compiler': reactCompiler,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier,
      vitest,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-compiler/react-compiler': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-namespace': [
        'error',
        {
          allowDeclarations: true,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-generic-constructors': 'off',
      'prettier/prettier': 'warn',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: vitest.environments.env.globals,
    },
    extends: [testingLibrary.configs['flat/react']],
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
)
