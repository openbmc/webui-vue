// =============================================================================
// Custom Cypress Commands
// =============================================================================

/**
 * Login command - wrapper for login flow
 * Usage: cy.login() or cy.login('root', '0penBmc')
 */
Cypress.Commands.add('login', (username = 'root', password = '0penBmc') => {
  cy.visit('/login');

  cy.get('[data-test-id="login-input-username"]')
    .click()
    .clear()
    .type(username);

  cy.get('[data-test-id="login-input-password"]')
    .click()
    .clear()
    .type(password);

  cy.get('[data-test-id="login-button-submit"]').click();
});

/**
 * Login via API - faster test setup
 */
Cypress.Commands.add('loginByApi', (username, password) => {
  cy.request({
    method: 'POST',
    url: '/login',
    body: { username, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200) {
      window.localStorage.setItem('storedUsername', username);
    }
  });
});

/**
 * Select element by data-test-id
 * More stable selector, not affected by CSS class changes
 */
Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-test-id="${testId}"]`);
});

/**
 * Wait for API request to complete
 */
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('be.oneOf', [200, 201]);
});

/**
 * Take screenshot for comparison
 */
Cypress.Commands.add('compareSnapshot', (name) => {
  cy.screenshot(name);
});
