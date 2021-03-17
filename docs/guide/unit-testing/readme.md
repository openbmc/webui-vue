# Unit Testing

 The goal of a unit test is to improve code quality and assure future
 development or refactoring does not result in broken builds and functionality.
 Tests that require consistent updating when refactoring code are likely tightly
 coupled to the internals of the component.

 > Writing unit tests is a constant struggle between writing enough tests and
 > not writing too many. I call this the unit testing Goldilocks rule—not too
 > many, not too few, but just enough. Thousands of tests for a small
 > application can be as damaging to development time as no tests.
 >
 > -- <cite>Ed Yerburgh, Testing Vue Applications (New York: Manning
 > Publications, 2019)</cite>

## Test Libraries
The OpenBMC Web UI unit test framework uses the Jest test runner and relies on
the following libraries:

- @vue/cli-plugin-unit-jest
- @vue/test-utils

## Test specification location and naming conventions
- Create the test files in the /tests/unit directory
- The naming convention is to replicate the folder and component name

### Examples
- The AppHeader.vue single-file component's (SFC) spec file is named
  `AppHeader.spec.js`
- Create a global component like `PageSection.vue` in the `/tests/global`
  directory with the name `PageSection.spec.js`
- Create a mixin like BVToastMixin  in the `/tests/mixins` directory with the
  name `BVToastMixin.spec.js` Running Tests

 ## Running Tests

The `test:unit` script will run all the test suites. Until the integration of
the test script with the continuous integration tool is complete, it needs to be
run manually before pushing up code for review. If you are working on fixing a
test that is failing, follow the guidelines for debugging a failed tests or
fixing failed snapshot tests.


### Debugging a failed test
The `test:unit:debugger` script will help to debug failing tests using the
Chrome Developer Tools. To debug a test:

1. Add a `debugger` statement in the specifications file
1. Run the unit test in debugger mode
1. Open the Chrome browser and go to `chrome://inspect`

### Fixing failed snapshot tests
The `test:update` script will update snapshot tests. If the UI has changed and
the snapshot tests are failing, after manually verifying the UI changes, run the
update script to update the snapshots. Running `test:update` can be dangerous,
as it will update all snapshot tests.

It is critical to verify all snapshot tests before running the update script.
The easiest way is to run the unit test in watch mode, `npm run test:unit --
--watch` and verify each snapshot.

## Guidelines
- Avoid coupling test code to source code when testing functionality
    - If test cases fail during refactoring, the test case may be tightly
      coupled with the application structure.
- A test should not break if the functionality it tests has not changed
- To maintain test readability, only pass in the data needed for the test to
  work in your mock object
- Avoid the creation of side-effects whenever possible
- There is no return on investment for testing presentational HTML
- Use `shallowMount` rather than mount unless child component rendering is
  required
- Avoid leaky tests by using `localVue` for all plugin installs, for example,
  when testing a plugin like Vuex

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
could potentially contribute to the project, the suggested strategy is to `test
store parts separately`.

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
- Requires the use of `localVue` when creating the store to avoid leaky tests

#### Pros
- Avoids mocking and brittle tests
- Refactoring does not break test unless contract changes

#### Cons
- Debugging is more difficult

## Vue Router
- Our current structure does not warrant testing the vue router
- If there is logic used for creating `RouteLink` items, we should unit test
  that functionality, which requires stubbing
- When testing a vue router, it is important to use localVue


[Vuex Testing](https://vuex.vuejs.org/guide/testing.html)

## Resources
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Knowing What To Test — Vue Component Unit
  Testing](https://vuejsdevelopers.com/2019/08/26/vue-what-to-unit-test-components/)
- [How to unit test a vuex
  Store](https://www.dev-tips-and-tricks.com/how-to-unit-test-a-vuex-store)