import pluginVue from 'eslint-plugin-vue';
import vitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Base ESLint recommended rules
  {
    name: 'base-config',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },

  // Vue recommended config
  ...pluginVue.configs['flat/recommended'],

  // Vue-specific rule overrides
  {
    name: 'vue-overrides',
    files: ['**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'kebab-case'],
      'vue/multi-word-component-names': 'off',
      'vue/no-deprecated-filter': 'off',
      'vue/no-useless-template-attributes': 'off',
      'vue/no-deprecated-props-default-this': 'off',
      // TODO: Fix these in a follow-up PR
      'vue/no-reserved-component-names': 'off',
      'vue/no-unused-components': 'off',
      'vue/no-deprecated-delete-set': 'off',
      'vue/no-required-prop-with-default': 'off',
    },
  },

  // JavaScript files config
  {
    name: 'js-config',
    files: ['**/*.js', '**/*.cjs', '**/*.mjs'],
  },

  // Vitest test files config
  {
    name: 'vitest-config',
    files: [
      '**/__tests__/*.{j,t}s?(x)',
      '**/tests/unit/**/*.spec.{j,t}s?(x)',
    ],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/expect-expect': 'warn',
      'vitest/no-identical-title': 'error',
      'vitest/no-focused-tests': 'error',
      'vitest/no-disabled-tests': 'warn',
      'vitest/valid-expect': 'error',
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
  },

  // Prettier config - must be last to override other formatting rules
  eslintConfigPrettier,

  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'docs/.vuepress/dist/**',
      '*.min.js',
    ],
  },
];
