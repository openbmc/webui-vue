module.exports = {
  presets: [['@vue/cli-plugin-babel/preset', { useBuiltIns: 'entry' }]],
  env: {
    test: {
      plugins: ['transform-require-context'],
    },
  },
};
