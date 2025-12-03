import { defineConfig } from 'cypress';

export default defineConfig({
  // E2E and Component testing in one framework
  experimentalMemoryManagement: true,

  e2e: {
    baseUrl: 'https://localhost:8000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',

    // Ignore HTTPS self-signed certificate errors
    chromeWebSecurity: false,

    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,

    // Auto wait settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,

    // Screenshot and video settings
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    video: true,
    videosFolder: 'cypress/videos',
    videoCompression: 32,

    experimentalRunAllSpecs: true,

    setupNodeEvents() {
      // Add plugins here
    },
  },

  // Retry on failure
  retries: {
    runMode: 2,
    openMode: 0,
  },
});
