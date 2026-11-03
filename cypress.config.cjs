const { defineConfig } = require('cypress');

module.exports = defineConfig({
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 15000,
    responseTimeout: 30000,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'evidencias-cypress',
    video: false,
    e2e: {
        baseUrl: 'http://localhost:5174',
        specPattern: 'tests/cypress/e2e/**/*.cy.js',
        supportFile: 'tests/cypress/support/e2e.js',
        experimentalRunAllSpecs: true
    }
});
