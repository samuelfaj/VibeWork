import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import perfectionist from 'eslint-plugin-perfectionist'
import security from 'eslint-plugin-security'
import unicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import importPlugin from 'eslint-plugin-import'
import etcPlugin from 'eslint-plugin-etc'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const localPlugin = jiti('./.eslint-rules/index.ts')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.turbo/**',
      'coverage/**',
      '.next/**',
      'build/**',
      'bun.lockb',
      '.env*',
      '**/.eslintcache',
      '**/*.js',
      '.eslint-rules/**',
    ],
  },

  // Base ESLint recommended + TypeScript ESLint recommended
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Strict TypeScript rules (hardcore spirit)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      perfectionist,
      security,
      unicorn,
      'unused-imports': unusedImports,
      import: importPlugin,
      etc: etcPlugin,
      sonarjs: sonarjsPlugin,
      local: localPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.mts', '.cts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // TypeScript - Strict type checking (hardcore)
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1],
          enforceConst: true,
          ignoreDefaultValues: true,
          ignoreClassFieldInitialValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
      '@typescript-eslint/no-shadow': [
        'error',
        {
          builtinGlobals: true,
          allow: ['defaultStatus', 'event', 'find', 'length', 'name', 'status', 'Notification', 'Text'],
          ignoreTypeValueShadow: true,
        },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'warn',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' },
      ],

      // unused-imports
      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Import rules
      'import/extensions': [
        'error',
        'ignorePackages',
        { ts: 'never', tsx: 'never', js: 'never', jsx: 'never', json: 'always' },
      ],
      'import/max-dependencies': ['error', { ignoreTypeImports: true }],
      'import/no-cycle': 'error',
      'import/no-self-import': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' },
            { pattern: '@infra/**', group: 'internal', position: 'before' },
            { pattern: '@i18n/**', group: 'internal', position: 'before' },
            { pattern: '@modules/**', group: 'internal', position: 'before' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // etc plugin
      'etc/no-const-enum': 'error',
      'etc/no-enum': 'error',
      'etc/no-t': 'error',

      // sonarjs
      'sonarjs/no-all-duplicated-branches': 'error',
      'sonarjs/no-element-overwrite': 'error',
      'sonarjs/no-extra-arguments': 'error',
      'sonarjs/no-identical-conditions': 'error',
      'sonarjs/no-identical-expressions': 'error',
      'sonarjs/no-redundant-boolean': 'error',
      'sonarjs/no-redundant-jump': 'error',
      'sonarjs/no-unused-collection': 'error',

      // Security (hardcore)
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-no-csrf-before-method-override': 'warn',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-require': 'warn',
      'security/detect-object-injection': 'off', // Too strict for general use
      'security/detect-possible-timing-attacks': 'warn',

      // Unicorn (hardcore - best practices and modern syntax)
      'unicorn/better-regex': 'error',
      'unicorn/catch-error-name': 'error',
      'unicorn/consistent-destructuring': 'error',
      'unicorn/error-message': 'error',
      'unicorn/escape-case': 'error',
      'unicorn/new-for-builtins': 'error',
      'unicorn/no-array-callback-reference': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-array-reduce': 'warn',
      'unicorn/no-console-spaces': 'error',
      'unicorn/no-empty-file': 'error',
      'unicorn/no-hex-escape': 'error',
      'unicorn/no-instanceof-builtins': 'error',
      'unicorn/no-new-array': 'error',
      'unicorn/no-new-buffer': 'error',
      'unicorn/no-process-exit': 'warn',
      'unicorn/no-static-only-class': 'error',
      'unicorn/no-this-assignment': 'error',
      'unicorn/no-unnecessary-await': 'error',
      'unicorn/no-unnecessary-polyfills': 'warn',
      'unicorn/no-unreadable-array-destructuring': 'warn',
      'unicorn/no-useless-fallback-in-spread': 'error',
      'unicorn/no-useless-length-check': 'error',
      'unicorn/no-useless-promise-resolve-reject': 'error',
      'unicorn/no-useless-spread': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/number-literal-case': 'error',
      'unicorn/numeric-separators-style': 'warn',
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-array-index-of': 'error',
      'unicorn/prefer-array-some': 'error',
      'unicorn/prefer-at': 'error',
      'unicorn/prefer-code-point': 'error',
      'unicorn/prefer-date-now': 'error',
      'unicorn/prefer-default-parameters': 'error',
      'unicorn/prefer-dom-node-append': 'error',
      'unicorn/prefer-dom-node-dataset': 'error',
      'unicorn/prefer-dom-node-remove': 'error',
      'unicorn/prefer-dom-node-text-content': 'error',
      'unicorn/prefer-export-from': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/prefer-logical-operator-over-ternary': 'warn',
      'unicorn/prefer-math-min-max': 'error',
      'unicorn/prefer-math-trunc': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/prefer-negative-index': 'error',
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/prefer-object-from-entries': 'error',
      'unicorn/prefer-optional-catch-binding': 'error',
      'unicorn/prefer-prototype-methods': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-reflect-apply': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-set-size': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      'unicorn/prefer-switch': 'warn',
      'unicorn/prefer-ternary': 'warn',
      'unicorn/prefer-top-level-await': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/relative-url-style': 'error',
      'unicorn/require-array-join-separator': 'error',
      'unicorn/require-post-message-target-origin': 'warn',
      'unicorn/string-content': 'off',
      'unicorn/switch-case-braces': ['error', 'avoid'],
      'unicorn/text-encoding-identifier-case': 'error',
      'unicorn/throw-new-error': 'error',

      // Perfectionist - organize imports and properties (hardcore)
      'perfectionist/sort-imports': 'off', // Too strict for existing codebases
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-object-types': 'off',
      'perfectionist/sort-objects': 'off',

      // Local custom rules
      'local/max-comment-lines': ['warn', 3],
      'local/module-isolation': 'error',
      'local/no-jsdoc': 'warn',
      'local/soft-max-lines': ['warn', { max: 400, skipBlankLines: false, skipComments: false }],
    },
  },

  // React plugin for frontend
  {
    files: ['frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Enforce Eden Treaty usage - never use fetch directly
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Do not use fetch() directly. Use Eden Treaty from @/lib/api instead.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message: 'Do not use fetch() directly. Use Eden Treaty from @/lib/api instead.',
        },
        {
          selector: "CallExpression[callee.object.name='window'][callee.property.name='fetch']",
          message: 'Do not use window.fetch() directly. Use Eden Treaty from @/lib/api instead.',
        },
        {
          selector: "CallExpression[callee.object.name='globalThis'][callee.property.name='fetch']",
          message: 'Do not use globalThis.fetch() directly. Use Eden Treaty from @/lib/api instead.',
        },
      ],
    },
  },

  // Test file exceptions (relax some strict rules for tests)
  {
    files: [
      '**/*.{test,spec}.{ts,tsx}',
      '**/jest.config.ts',
      '**/vitest.config.ts',
      '**/tests/**',
      '**/__tests__/**',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-shadow': [
        'error',
        {
          builtinGlobals: true,
          allow: ['defaultStatus', 'event', 'find', 'length', 'name', 'status', 'screen'],
        },
      ],
      '@typescript-eslint/consistent-type-assertions': 'off',
      'import/max-dependencies': 'off',
      'security/detect-non-literal-regexp': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/no-useless-undefined': 'off',
    },
  },

  // Prettier compatibility (must be last)
  eslintConfigPrettier,
]
