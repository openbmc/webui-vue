// =============================================================================
// BMC Login Tests - Showcase Cypress Features
// =============================================================================

describe('BMC Login Test', () => {
  it('should login successfully', () => {
    cy.visit('/login');

    cy.get('#username').should('be.visible');

    cy.get('#username')
      .click()
      .clear()
      .type('root');

    cy.get('#password')
      .click()
      .clear()
      .type('0penBmc');

    cy.get('button[type="submit"]').click();

    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });
});

// =============================================================================
// Feature #1: Time Travel Debugging
// In Cypress UI, click any step to see DOM state at that moment
// =============================================================================

describe('Time Travel Demo', () => {
  it('observe DOM changes at each step', () => {
    cy.visit('/login');

    // Step 1: Initial page state
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');

    // Step 2: Type username (click this step in UI to see typing)
    cy.get('#username').type('root');

    // Step 3: Type password
    cy.get('#password').type('0penBmc');

    // Step 4: Button state
    cy.get('button[type="submit"]').should('be.enabled');

    // Step 5: Click login
    cy.get('button[type="submit"]').click();

    // Step 6: Page state after redirect
    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });
});

// =============================================================================
// Feature #2: Auto Screenshot
// Take screenshots at any step, auto screenshot on failure
// =============================================================================

describe('Screenshot Demo', () => {
  it('login flow screenshots', () => {
    cy.visit('/login');

    // Screenshot: Login page
    cy.screenshot('01-login-page');

    cy.get('#username').type('root');
    cy.get('#password').type('0penBmc');

    // Screenshot: Form filled
    cy.screenshot('02-form-filled');

    cy.get('button[type="submit"]').click();
    cy.contains('Overview', { timeout: 15000 }).should('be.visible');

    // Screenshot: Login success
    cy.screenshot('03-login-success');
  });
});

// =============================================================================
// Feature #3: Session Caching (Speed up tests)
// Login once, reuse session for multiple tests
// =============================================================================

describe('Session Cache Demo - Login once, test many', () => {
  beforeEach(() => {
    cy.session('bmc-root-session', () => {
      cy.visit('/login');
      cy.get('#username').type('root');
      cy.get('#password').type('0penBmc');
      cy.get('button[type="submit"]').click();
      cy.contains('Overview', { timeout: 15000 }).should('be.visible');
    });
  });

  it('Test 1: Quick access to home page', () => {
    cy.visit('/');
    cy.contains('Overview').should('be.visible');
  });

  it('Test 2: Access Sensors page', () => {
    cy.visit('/#/hardware-status/sensors');
    cy.url().should('include', 'sensors');
  });

  it('Test 3: Access Event Logs page', () => {
    cy.visit('/#/logs/event-logs');
    cy.url().should('include', 'event-logs');
  });
});

// =============================================================================
// Feature #4: Network Intercept (Mock API)
// Intercept and mock API responses
// =============================================================================

describe('Network Intercept Demo', () => {
  it('monitor login API requests', () => {
    cy.intercept('POST', '**/login').as('loginRequest');
    cy.intercept('POST', '**/redfish/v1/SessionService/Sessions').as('sessionRequest');

    cy.visit('/login');
    cy.get('#username').type('root');
    cy.get('#password').type('0penBmc');
    cy.get('button[type="submit"]').click();

    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });

  it('monitor all API calls on page load', () => {
    cy.intercept('GET', '**/redfish/**').as('redfishApi');

    cy.visit('/login');
    cy.get('#username').type('root');
    cy.get('#password').type('0penBmc');
    cy.get('button[type="submit"]').click();

    cy.contains('Overview', { timeout: 15000 }).should('be.visible');

    // See all intercepted requests in Cypress UI Network panel
  });
});

// =============================================================================
// Feature #5: Auto Wait & Retry
// Cypress auto waits for elements, auto retries assertions
// =============================================================================

describe('Auto Wait Demo', () => {
  it('auto wait for elements', () => {
    cy.visit('/login');

    // No sleep needed! Cypress auto waits for elements
    cy.get('#username').should('be.visible');
    cy.get('#password').should('be.visible');

    cy.get('#username').type('root');
    cy.get('#password').type('0penBmc');
    cy.get('button[type="submit"]').click();

    // Auto wait for page redirect and content
    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });
});

// =============================================================================
// Feature #6: Element Interactions
// Simulate various user actions
// =============================================================================

describe('User Interaction Demo', () => {
  it('keyboard - login with Enter key', () => {
    cy.visit('/login');

    cy.get('#username').type('root');

    // Press Enter in password field to submit form
    cy.get('#password').type('0penBmc{enter}');

    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });

  it('clear and retype', () => {
    cy.visit('/login');

    // Type wrong credentials first
    cy.get('#username').type('wrong_user');
    cy.get('#password').type('wrong_pass');

    // Clear and type correct credentials
    cy.get('#username').clear().type('root');
    cy.get('#password').clear().type('0penBmc');

    cy.get('button[type="submit"]').click();
    cy.contains('Overview', { timeout: 15000 }).should('be.visible');
  });
});
