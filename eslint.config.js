/**
 * Lean ESLint flat config for AI agents + humans.
 * Goal: boundaries + correctness, not style drama.
 * Hardcore / unicorn / sonarjs / perfectionist removed.
 */
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import path from 'path'
import { fileURLToPath } from 'url'
import { createJiti } from 'jiti'

const jiti = createJiti(import.meta.url)
const localPlugin = jiti('./.eslint-rules/index.ts')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist-types/**',
      '.turbo/**',
      'coverage/**',
      'build/**',
      'bun.lockb',
      '.env*',
      '**/.eslintcache',
      '**/*.js',
      '.eslint-rules/**',
      'e2e/**',
      'infra/**',
      'docs/**',
      'scripts/**',
      // Tooling configs are not in app tsconfig `include` (project: true fails)
      '**/vite.config.ts',
      '**/vitest.config.ts',
      '**/playwright.config.ts',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,

  {
    files: ['**/*.{ts,tsx}'],
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
      'unused-imports': unusedImports,
      local: localPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],

      'no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
      ],

      // Backend module boundaries (@modules/*)
      'local/module-isolation': 'error',
      'local/soft-max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
      'local/max-comment-lines': 'off',
      'local/no-jsdoc': 'off',
    },
  },

  // Frontend: no raw fetch; domain uses Eden / auth hooks
  {
    files: ['frontend/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Do not use fetch() directly. Use unwrapEden(api…) from @/lib/api, or @/features/auth hooks for session.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'Do not use fetch() directly. Use unwrapEden(api…) from @/lib/api, or @/features/auth hooks for session.',
        },
      ],
    },
  },

  // Feature isolation + authClient private to auth
  {
    files: ['frontend/src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/features/auth/hooks',
                '**/features/auth/LoginForm',
                '**/features/auth/SignupForm',
                '**/features/auth/RequireAuth',
                '**/features/notifications/hooks',
                '**/features/notifications/NotificationsPage',
                '../auth/hooks',
                '../auth/LoginForm',
                '../notifications/hooks',
                '../../features/*/hooks',
                '../../features/*/*',
              ],
              message:
                'Import other features only from their public barrel (@/features/<name>).',
            },
            {
              group: ['**/lib/authClient', '../../lib/authClient', '@/lib/authClient'],
              message:
                'authClient is private to features/auth. Use hooks from @/features/auth.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['frontend/src/features/auth/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '**/features/notifications/**',
                '../notifications/**',
                '../../features/notifications/**',
              ],
              message: 'auth must not depend on other product features.',
            },
          ],
        },
      ],
    },
  },

  // Tests: relax noise
  {
    files: ['**/*.{test,spec}.{ts,tsx}', '**/tests/**', '**/seeders/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'local/soft-max-lines': 'off',
    },
  },
]
