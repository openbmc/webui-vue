// =============================================================================
// Cypress E2E Test Support File
// =============================================================================
// IMPORTANT: Before running tests, you must configure your BMC credentials:
//
// 1. Copy cypress.env.json.example to cypress.env.json
// 2. Edit cypress.env.json and set your BMC username and password
//
// Example cypress.env.json:
// {
//   "username": "root",
//   "password": "your_password",
//   "loginTimeout": 15000
// }
//
// Note: cypress.env.json is in .gitignore to protect credentials
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
