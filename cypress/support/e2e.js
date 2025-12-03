// =============================================================================
// Cypress E2E Test Support File
// =============================================================================

import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing on uncaught exceptions
  // Useful when testing third-party libraries
  return false;
});

// Note: Don't clear localStorage and cookies here
// It will break cy.session() caching
// Clear in individual tests if needed
