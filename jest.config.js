module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/no-babel',
  transformIgnorePatterns: ['/node_modules/(?!@carbon)'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
};
