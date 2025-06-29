import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Ignore TMP directory and test files
  {
    ignores: [
      'dist/**/*',
      'TMP: [SaaS] EW Minimal Backend/**/*',
    ]
  },

  // Basic JavaScript config for all JS files
  {
    files: ['**/*.{js,mjs,cjs}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    }
  },

   // Service worker files configuration
   {
    files: ['**/worker/firebase-messaging-sw.js', '**/firebase-messaging-sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        importScripts: 'readonly',
        firebase: 'readonly'
      }
    }
  },

  // Client React Hook TypeScript configuration
  {
    files: ['client/examples/react/**/*.ts', 'client/examples/react/**/*.tsx'],
    plugins: {
      '@typescript-eslint': ts
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        window: 'readonly',
        document: 'readonly'
      }
    },
    rules: {
      ...ts.configs.recommended.rules,
    }
  },

  // TypeScript backend specific configuration
  {
    files: ['src/**/*.ts'],
    plugins: {
      '@typescript-eslint': ts
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    rules: {
      ...ts.configs.recommended.rules,
      ...ts.configs['recommended-requiring-type-checking'].rules,
      'require-await': 'error',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
    }
  },

  // Apply Prettier config last
  prettier
];
