import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import importXPlugin from 'eslint-plugin-import-x'
import reactPlugin from 'eslint-plugin-react'
import reactRefreshPlugin from 'eslint-plugin-react-refresh'
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  importXPlugin.configs.typescript,
  reactPlugin.configs.flat.recommended,
  prettierConfig,
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importXPlugin,
      react: reactPlugin,
      'react-refresh': reactRefreshPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      '@typescript-eslint/consistent-type-definitions': 'off',
      'import-x/named': 'error',
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'warn',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
)
