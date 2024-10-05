import { config, configs, parser, plugin } from 'typescript-eslint'
import eslint from '@eslint/js'
import importX from 'eslint-plugin-import-x'
import react from 'eslint-plugin-react'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'
import jest from 'eslint-plugin-jest'
import jestDom from 'eslint-plugin-jest-dom'

export default config(
  eslint.configs.recommended,
  ...configs.recommendedTypeChecked,
  ...configs.stylisticTypeChecked,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  prettierConfig,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js', '*.cjs'],
          defaultProject: './tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': plugin,
      'react-refresh': reactRefresh,
      prettier,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      'prettier/prettier': 'warn',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
      jest: {
        version: 'detect',
      },
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    ...jest.configs['flat/recommended'],
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    ...jestDom.configs['flat/recommended'],
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      parser,
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
  {
    ignores: ['dist', 'coverage'],
  },
)
