/**
 * ESLint 9 flat config for webui-vue
 *
 * Uses dynamic imports to gracefully handle CI environments where
 * npm dependencies are not installed. The OpenBMC CI runs its own
 * ESLint without running npm install first.
 */

async function createConfig() {
  // Try to load project dependencies - they may not be available in CI
  let pluginVue, vitest, eslintConfigPrettier, globals;

  try {
    [pluginVue, vitest, eslintConfigPrettier, globals] = await Promise.all([
      import('eslint-plugin-vue'),
      import('@vitest/eslint-plugin'),
      import('eslint-config-prettier'),
      import('globals'),
    ]);

    // Handle default exports
    pluginVue = pluginVue.default || pluginVue;
    vitest = vitest.default || vitest;
    eslintConfigPrettier = eslintConfigPrettier.default || eslintConfigPrettier;
    globals = globals.default || globals;
  } catch {
    // Dependencies not available (CI environment without npm install)
    // Return minimal config - CI will use its own linting rules
    console.warn(
      'ESLint: Project dependencies not found, using minimal config.',
    );
    console.warn('Run "npm install" for full linting support.');
    return [
      {
        // Only lint JS/Vue files, ignore everything else
        files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.vue'],
        languageOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
        },
        rules: {},
      },
      {
        // Comprehensive ignores for CI environment
        ignores: [
          'node_modules/**',
          'dist/**',
          'coverage/**',
          'docs/.vuepress/dist/**',
          '**/*.json',
          '**/*.md',
          '**/*.yaml',
          '**/*.yml',
          '**/*.scss',
          '**/*.css',
          '**/*.html',
          '**/*.svg',
          '**/*.png',
          '**/*.ico',
        ],
      },
    ];
  }

  return [
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
}

export default createConfig();
