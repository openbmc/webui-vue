module.exports = {
  presets: [
    [
      '@vue/app',
      {
        targets: { esmodules: false },
        polyfills: false,
      },
    ],
  ],
  env: {
    test: {
      plugins: ['transform-require-context'],
    },
  },
};
