module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transformIgnorePatterns: ['/node_modules/(?!@carbon)'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
};
