module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/prettier',
  ],
  rules: {
    'no-console': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'all',
      },
    ],
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/multi-word-component-names': 'off',
    'vue/no-deprecated-filter': 'off',
    'vue/no-useless-template-attributes': 'off',
    'vue/no-deprecated-props-default-this': 'off',
  },
  parser: 'vue-eslint-parser',
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)',
      ],
      env: {
        jest: true,
      },
    },
  ],
};
