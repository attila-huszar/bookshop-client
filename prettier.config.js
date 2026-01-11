/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  endOfLine: 'lf',
  tabWidth: 2,
  semi: false,
  bracketSameLine: true,
  singleQuote: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^react(-.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^@/api(/.*)?$',
    '^@/routes(/.*)?$',
    '^@/store(/.*)?$',
    '^@/pages(/.*)?$',
    '^@/components(/.*)?$',
    '^@/hooks(/.*)?$',
    '^@/helpers(/.*)?$',
    '^@/libs(/.*)?$',
    '^@/validation(/.*)?$',
    '^@/constants(/.*)?$',
    '^@/errors(/.*)?$',
    '^@/types(/.*)?$',
    '^@/assets(/.*)?$',
    '^@/styles(/.*)?$',
    '^\\.\\./',
    '^\\./',
    '^.+\\.s?css$',
  ],
  importOrderSortSpecifiers: true, // Alphabetically sort named imports inside statements
  importOrderGroupNamespaceSpecifiers: true, // Group namespace imports (* as X) separately
  importOrderCaseInsensitive: true, // Case-insensitive sorting
  importOrderSideEffects: false, // Keep side-effect imports at the top
}

export default config
