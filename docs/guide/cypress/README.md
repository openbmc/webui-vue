# Cypress Testing Guide

## Quick Start

### Install

```bash
npm install
```

### Run Tests

```bash
# Open Cypress interactive UI (recommended for time travel feature)
npm run cy:open

# Run all tests in terminal
npm run cy:run

# Run E2E tests only
npm run cy:run:e2e

# Run with Chrome browser (headed mode)
npm run cy:run:headed

# Start dev server and run E2E tests
npm run test:e2e

# Start dev server and open Cypress UI
npm run test:e2e:dev
```

---

## Key Features

### 1. Time Travel Debugging

Click any step in Cypress UI to see DOM state at that moment.

```javascript
it('demo time travel', () => {
  cy.visit('/login');
  cy.get('#username').type('admin');    // Step 1
  cy.get('#password').type('password'); // Step 2
  cy.get('button').click();             // Step 3
});
```

### 2. Auto Wait

No need for sleep or waitFor:

```javascript
// Selenium needs this
await driver.wait(until.elementLocated(By.id('button')), 5000);

// Cypress auto waits
cy.get('#button').click();
```

### 3. Network Intercept

```javascript
// Mock API response
cy.intercept('GET', '/api/users', {
  statusCode: 200,
  body: [{ id: 1, name: 'John' }]
}).as('getUsers');

cy.visit('/');
cy.wait('@getUsers');
```

### 4. Real Browser Environment

Unlike Jest + jsdom, Cypress runs in real browser:

- Real CSS rendering
- Real user interactions
- Real browser APIs

```javascript
// Test different viewports
cy.viewport('iphone-x');
cy.viewport(1280, 720);
```

### 5. Clear Error Messages

When test fails, Cypress provides:

- Auto screenshot
- Full DOM history
- Detailed stack trace
- Network request logs

---

## Test File Structure

```text
cypress/
├── e2e/                      # E2E tests
│   └── real-login.cy.js      # Login tests
├── fixtures/                 # Mock data
│   └── redfish-mock.json
└── support/
    ├── commands.js           # Custom commands
    └── e2e.js               # E2E config
```

---

## Best Practices

### Use data-test-id for Selectors

```vue
<template>
  <button data-test-id="login-button">Login</button>
</template>
```

```javascript
cy.getByTestId('login-button').click();
```

### Create Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('#username').type(username);
  cy.get('#password').type(password);
  cy.get('button[type="submit"]').click();
});

// Usage
cy.login('admin', 'password');
```

### Use Session Caching

```javascript
beforeEach(() => {
  cy.session('admin-session', () => {
    cy.login('admin', 'password');
  });
});
```

---

## Run Demo

```bash
npm run cy:run:headed
```

---

## Resources

- [Cypress Docs](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Vue + Cypress](https://docs.cypress.io/guides/component-testing/vue/overview)
