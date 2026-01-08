# Unit Testing

The goal of a unit test is to improve code quality and assure future development
or refactoring does not result in broken builds and functionality. Tests that
require consistent updating when refactoring code are likely tightly coupled to
the internals of the component.

> Writing unit tests is a constant struggle between writing enough tests and not
> writing too many. I call this the unit testing Goldilocks rule—not too many,
> not too few, but just enough. Thousands of tests for a small application can
> be as damaging to development time as no tests.
>
> -- Ed Yerburgh, Testing Vue Applications (New York: Manning
> Publications, 2019)

## Test Libraries

The OpenBMC Web UI unit test framework uses Vitest as the test runner and relies
on the following libraries:

- vitest - Fast Vite-native test runner
- @vue/test-utils - Official Vue.js testing utilities
- happy-dom - Fast DOM implementation for testing
- vue3-snapshot-serializer - Snapshot serializer for Vue 3 components

## Test Configuration

Vitest is configured in `vite.config.js` under the `test` section:

```js
test: {
  globals: true,
  environment: 'happy-dom',
  setupFiles: ['./tests/vitest.setup.js'],
  include: ['tests/unit/**/*.spec.js'],
  css: false,
  snapshotSerializers: ['vue3-snapshot-serializer'],
}
```

### Setup File

The `tests/vitest.setup.js` file configures global mocks and stubs used across
all tests:

- SVG component stubs to avoid verbose path data in snapshots
- Vue Router mocks for components using routing
- Global mocks for `$t`, `$route`, and `$eventBus`
- Bootstrap Vue Next component stubs
- The real i18n instance from the app (not a mock) - all translations work in
  tests just like in the application

### Test Utilities

The `tests/unit/testUtils.js` file provides helper functions:

- `createTestI18n()` - Creates a minimal i18n instance with subset of
  translations (*only* for tests that need custom i18n configuration)
- `bootstrapStubs` - Common Bootstrap Vue Next component stubs with proper
  v-model support
- `createModalStub()` - Creates modal stubs with ref methods
- `createTestStore()` - Creates a basic Vuex store for testing

Note: Most tests don't need `createTestI18n()` since the real i18n instance is
already configured globally in the setup file.

## Test specification location and naming conventions

- Create the test files in the /tests/unit directory
- The naming convention is to replicate the folder and component name

### Examples

- The AppHeader.vue single-file component's (SFC) spec file is named
  `AppHeader.spec.js`
- Create a global component like `PageSection.vue` in the `/tests/unit/Global`
  directory with the name `PageSection.spec.js`
- Create a mixin like VuelidateMixin in the `/tests/unit/Mixins` directory with
  the name `VuelidateMixin.spec.js`

## Running Tests

The following npm scripts are available for running tests:

| Script                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run test`          | Run all test suites once                  |
| `npm run test:unit`     | Run all test suites once (alias for test) |
| `npm run test:watch`    | Run tests in watch mode for development   |
| `npm run test:coverage` | Run tests with code coverage report       |

### Running specific tests

Vitest supports filtering tests by filename or pattern:

```bash
# Run a specific test file
npm run test -- PageSection

# Run tests matching a pattern
npm run test -- --grep "should render"

# Run tests in a specific directory
npm run test -- tests/unit/Global
```

### Watch mode

Watch mode is useful during development. It will re-run tests when files change:

```bash
npm run test:watch
```

In watch mode, you can press `u` to update failing snapshots interactively.

### Debugging a failed test

Vitest provides several options for debugging tests:

1. **Console output**: Add `console.log()` statements in your test
2. **Browser mode**: Run `npx vitest --ui` to open the Vitest UI in a browser
3. **VS Code debugger**: Use the built-in Node.js debugger with the Vitest
   extension

### Fixing failed snapshot tests

To update snapshot tests after verifying UI changes are intentional:

```bash
# Update all snapshots
npm run test -- --update

# Or in watch mode, press 'u' to update snapshots interactively
npm run test:watch
```

It is critical to verify all snapshot changes before updating. The watch mode
interactive update (`u` key) is the safest approach as it shows each change.

## Guidelines

- Avoid coupling test code to source code when testing functionality
  - If test cases fail during refactoring, the test case may be tightly coupled
    with the application structure.
- A test should not break if the functionality it tests has not changed
- To maintain test readability, only pass in the data needed for the test to
  work in your mock object
- Avoid the creation of side-effects whenever possible
- There is no return on investment for testing presentational HTML
- Use `shallowMount` rather than mount unless child component rendering is
  required
- Use `global.plugins` in mount options for plugin configuration (Vue 3 pattern)
- Use `global.stubs` for component stubs and `global.mocks` for mocks

## Components

### What to test

1. Test the function's inputs and outputs
   - Test only dynamically generated output
   - Test only output that is part of the component contract
1. Test any side-effects
1. Test correct rendering using a snapshot test

### What not to test

1. Don't test third-party functionality
1. Don't test the internals of your components or that specific functions are
   called. This can lead to unnecessary refactoring.
1. Don't go beyond the input and outputs of the component
1. Don't test the functionality of other libraries
1. Static components do not need unit tests, use snapshot testing

### Strategy

1. Define a component contract that is based upon the component API
1. Create smaller functions with a specific purpose to make testing easier
1. Test the component API by writing tests first and then writing code to fix
   the tests
1. Add a snapshot test once the presentational layer is validated through manual
   visual testing

### Snapshot Testing

A snapshot test is a comparison of the code from two different points in time.
When the view is rendering as expected, a snapshot is taken and when the test
suite is run, this snapshot is compared to the current code to make sure nothing
has changed.

This type of testing is good for testing that static content output has not
changed due to any code updates or refactoring. Too many snapshots can slow down
development during refactors. Typically, these are written once the UI
presentational layer is complete and validated.

## Vuex Store

There are two testing strategies for testing a Vuex store, which include testing
store parts separately or testing a running store instance. Each strategy has
its pros and cons. Given the size of the store and the number of developers that
could potentially contribute to the project, the suggested strategy is to
`test store parts separately`.

### Testing Store Parts Separately

Testing the parts separately is easy since each of the parts is a JavaScript
function. Store parts to test include `actions`, `getters`, and `mutations`.

#### Actions

Since HTTP calls should never be used in a test, actions require extreme
mocking. Mocking tests rely on assumptions and can lead to faulty tests.

#### Getters

Getters are JavaScript functions that return an output. These are basic
functions that may not require testing unless there is getter logic. Any logic
in a getter should be tested.

#### Mutations

Mutations are JavaScript functions that mutate the store state. These are basic
functions that may not require testing unless there is mutation logic. Any logic
in a mutation should be tested.

#### Pros

- Easier to debug
- Smaller tests

#### Cons

- Requires extreme mocking when testing actions
- Tightly coupled with implementation details
- More maintenance required when refactoring

### Testing Store Instance

- Uses mutations and actions as inputs
- State is the output
- Use `global.plugins: [store]` when mounting components that need the store

#### Pros

- Avoids mocking and brittle tests
- Refactoring does not break test unless contract changes

#### Cons

- Debugging is more difficult

## Vue Router

- Our current structure does not warrant testing the vue router
- If there is logic used for creating `RouterLink` items, we should unit test
  that functionality, which requires stubbing
- The router is mocked globally in `vitest.setup.js` with `useRouter` and
  `useRoute` composables

## Example Test

Here is an example of a basic component test:

```js
import { mount } from '@vue/test-utils';
import PageSection from '@/components/Global/PageSection';

describe('PageSection.vue', () => {
  const wrapper = mount(PageSection, {
    props: {
      sectionTitle: 'PageSection test title',
    },
  });

  it('should exist', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should render h2 element', () => {
    expect(wrapper.find('h2').exists()).toBe(true);
  });

  it('should render correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });
});
```

For components requiring a Vuex store or custom stubs, use the test utilities:

```js
import { mount } from '@vue/test-utils';
import { createTestStore, bootstrapStubs } from '../testUtils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent.vue', () => {
  const wrapper = mount(MyComponent, {
    global: {
      plugins: [createTestStore()],
      stubs: bootstrapStubs,
    },
  });

  // ... tests
});
```

Note: i18n is already configured globally in `vitest.setup.js`, so you don't
need to add it to plugins unless you need a custom configuration.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils (Vue 3)](https://test-utils.vuejs.org/)
- [Vuex Testing](https://vuex.vuejs.org/guide/testing.html)
- [Knowing What To Test — Vue Component Unit Testing](https://vuejsdevelopers.com/2019/08/26/vue-what-to-unit-test-components/)
