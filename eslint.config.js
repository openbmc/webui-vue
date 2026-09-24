/**
 * ESLint 9 flat config for webui-vue
 *
 * Uses dynamic imports to gracefully handle CI environments where
 * npm dependencies are not installed. The OpenBMC CI runs its own
 * ESLint without running npm install first.
 */

async function createConfig() {
  // Try to load project dependencies - they may not be available in CI
  let js,
    pluginVue,
    vitest,
    eslintConfigPrettier,
    eslintPluginPrettier,
    globals,
    tsParser,
    tsPlugin;

  try {
    [
      js,
      pluginVue,
      vitest,
      eslintConfigPrettier,
      eslintPluginPrettier,
      globals,
      tsParser,
      tsPlugin,
    ] = await Promise.all([
      import('@eslint/js'),
      import('eslint-plugin-vue'),
      import('@vitest/eslint-plugin'),
      import('eslint-config-prettier'),
      import('eslint-plugin-prettier'),
      import('globals'),
      import('@typescript-eslint/parser'),
      import('@typescript-eslint/eslint-plugin'),
    ]);

    // Handle default exports
    js = js.default || js;
    pluginVue = pluginVue.default || pluginVue;
    vitest = vitest.default || vitest;
    eslintConfigPrettier = eslintConfigPrettier.default || eslintConfigPrettier;
    eslintPluginPrettier = eslintPluginPrettier.default || eslintPluginPrettier;
    globals = globals.default || globals;
    tsParser = tsParser.default || tsParser;
    tsPlugin = tsPlugin.default || tsPlugin;
  } catch (err) {
    // Dependencies not available (CI environment without npm install)
    // Return minimal config - CI will use its own linting rules.
    // Surface the real error so misconfigured local setups are not masked as
    // "missing deps" and end up with silent, no-op linting.
    console.warn(
      'ESLint: Project dependencies not found, using minimal config.',
    );
    console.warn('Run "npm install" for full linting support.');
    console.warn('Underlying error:', err && err.message ? err.message : err);
    return [
      {
        // Only lint JS/TS/Vue files, ignore everything else
        files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.vue'],
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
        ...js.configs.recommended.rules,
        'no-console': 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-duplicate-imports': 'error',
      },
    },

    // Vue recommended config
    ...pluginVue.configs['flat/recommended'],

    // Vue-specific rule overrides.
    // Wire the TypeScript parser into <script lang="ts"> blocks so
    // vue-eslint-parser can delegate script parsing correctly.
    {
      name: 'vue-overrides',
      files: ['**/*.vue'],
      languageOptions: {
        parserOptions: {
          parser: tsParser,
          ecmaVersion: 'latest',
          sourceType: 'module',
          extraFileExtensions: ['.vue'],
        },
      },
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

    // TypeScript files config
    {
      name: 'ts-config',
      files: ['**/*.ts', '**/*.tsx'],
      languageOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
      },
      rules: {
        ...tsPlugin.configs.recommended.rules,
        // Prefer the TS-aware unused-vars rule over the core one.
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
      },
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

    // Disable ESLint rules that conflict with Prettier formatting.
    eslintConfigPrettier,

    // Run Prettier as an ESLint rule so formatting issues surface in the
    // editor and in `npm run lint`. Options are read from .prettierrc.yaml.
    {
      name: 'prettier-rule',
      plugins: { prettier: eslintPluginPrettier },
      rules: {
        'prettier/prettier': 'error',
      },
    },

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

// Await the config so the default export is a plain array, which is what the
// VS Code ESLint extension expects. Exporting a Promise works with the CLI but
// causes some extension versions to silently treat the config as empty.
export default await createConfig();
