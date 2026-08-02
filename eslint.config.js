import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

import autoImportConfig from './app/.eslintrc-auto-import.json' with { type: 'json' };

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'app/fixtures/**', '**/*.d.ts'],
  },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['bin/**', 'src/**', 'scripts/**', '*.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['app/**'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...autoImportConfig.globals,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    files: ['src/cli.js'],
    rules: {
      'no-useless-assignment': 'off',
    },
  },
  prettier,
];
