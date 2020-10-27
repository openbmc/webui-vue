# Unit Testing

 The goal of a unit test is to improve code quality and assure future development or refactoring does not result in broken builds and functionality. Code that requires consistent updating as code is refactored is likely tightly-coupled to the internals of the component.

 > Writing unit tests is a constant struggle between writing enough tests and not writing too many. I call this the unit testing Goldilocks rule—not too many, not too few, but just enough. Thousands of tests for a small application can be as damaging to development time as no tests.
 >
 > -- <cite>Ed Yerburgh</cite>

## Test Libraries
The OpenBMC Web UI unit test framework uses the Jest test runner and relies on the following libraries:

- @vue/cli-plugin-unit-jest
- @vue/test-utils

 ## Running Tests

The `test:unit` script is run by the CI script on each push to Gerrit. It is also the script to run when writing a unit test.

### Debugging a failed test
The `test:unit:debugger` script is run to debug failing tests using the Chrome Developer Tools. To debug a test:
1. Add a `debugger` statement in the spec file
1. Run the unit test in debugger mode
1. Open the Chrome browser and go to `chrome://inspect`

### Fixing failed snapshot tests
The `test:update` script will update snapshot tests. If the UI has changed and the snapshot tests are failing, after manually verifying the UI changes, run the update script to update the snapshots. This can be `dangerous` as it will update all snapshots, even if that was not the intention.

All snapshot tests need to be verified before running the update script. The easiest way is to run the unit test in watch mode, `npm run test:unit -- --watch` and verify each snapshot.

## Test specification location and naming conventions
- The test files are stored in the `/tests/unit` directory
- The naming convention is to replicate the folder and component name

### Examples
- The `AppHeader.vue` single-file component's (SFC) spec file will be named `AppHeader.spec.js`
- A global component like `PageSection.vue` should be created in the `/tests/global` directory with the name `PageSection.spec.js`
- A mixin like `BVToastMixin` should be created in the `/tests/mixins` directory with the name `BVToastMixin.spec.js`

## Guidelines
- Avoid coupling test code to source code when testing code functionality
    - If test cases fail during refactoring, it is possible that the test case is tightly-coupled with the application structure.
- A test should not break if the functionality it tests does not change
- To maintain test readability, only pass in the data needed for the test to work in your mock object
- Avoid the creation of side-effects when possible
- There is no return on investment for testing _presentational_ HTML
- Use `shallowMount` rather than `mount` unless child component rendering is required
- Avoid leaky tests by using `localVue` for all plugin installs, e.g. Vuex

## Testing Components

### What to test
1. Test the function's inputs and outputs
    - Test only output that is dynamically generated
    - Test only output that is part of the component contract
1. Test any side-effects
1. Test correct rendering using a snapshot test

### What not to test
1. Don't test third-party functionality
1. Don't test the internals of your components or that specific functions are called. This can lead to unnecessary refactoring.
1. Don't go beyond the input and outputs of the component
1. Don't test the functionality of other libraries
1. Static components do not need unit tests, use snapshot testing

### Strategy
1. Define a component contract that is based upon the component API
1. Create smaller functions with a specific purpose to make testing easier
1. Test the component API by writing tests first and then writing code to fix the tests
1. Add a snapshot test once the presentational layer is validated through manual visual testing

### Snapshot Testing
A snapshot test is a comparison of the code from two different points in time. When the view is determined to be rendering as expected, a snapshot is taken and when the test suite is run, this snapshot is compared to the current code to make sure nothing has changed.

This type of testing is good for testing that static content outuput has not changed due to any code updates or refactoring. Too many snapshots can slow down development during refactors. Typically, these are written once the UI presentational layer is complete and validated.



## Testing Mixins and Filters
- Create component with minimum options to make test small and simple to understand
- ...

## Testing Vuex Store
There are two testing strategies for testing a Vuex store:
- Testing store parts separately
- Testing a running store instance

### Testing Store Parts
Testing the parts separately is easy since each of the parts is a JavaScript function. Store parts to test include actions, getters, and mutations.

#### Actions
Since HTTP calls should never be used in a test, actions requires extreme mocking. Mocking tests rely on assumptions and can lead to faulty tests.

#### Getters
Getters are JavaScript that return an output. These are basic functions that may not require testing unless there is logic in the getter. Any logic in a getter should be tested.

#### Mutations
Mutations are JavaScript that mutates store state. These are basic functions that may not require testing unless there is logic in the mutation. Any logic in a mutation should be tested.

#### Pros
- Easier to debug
- Smaller tests

#### Cons
- Requires extreme mocking when testing actions
- Tightly-coupled with implementation details
- More maintenance required when refactoring

### Testing Store Instance
- Uses mutations and actions is inputs
- State is the output
- Requires the use of localVue when creating the store to avoide leaky tests

#### Pros
- Avoids mocking and brittle tests
- Refactoring does not break test unless contract changes

#### Cons
- Debugging is more difficult

## Testing Vue Router
- Our current structure does not warrant testing the vue router
- If there is logic used for creating `RouteLink` items, we should unit test that functionality, which requires stubbing
- When testing a vue router, it is important to use localVue


[Vuex Testing](https://vuex.vuejs.org/guide/testing.html)

## Resources
- [Vue Test Utils](https://vue-test-utils.vuejs.org/)
- [Unit testing with Vue — Approach, tips, and tricks — Part 1](https://medium.com/pixelmatters/unit-testing-with-vue-approach-tips-and-tricks-part-1-b7d3209384dc)
- [Unit testing with Vue — Approach, tips, and tricks — Part 2](https://medium.com/pixelmatters/unit-testing-with-vue-approach-tips-and-tricks-part-2-61abc10b2d33)
- [Five Traps to Avoid While Unit Testing Vue.js](https://engineering.doximity.com/articles/five-traps-to-avoid-while-unit-testing-vue-js)
- [Knowing What To Test — Vue Component Unit Testing](https://vuejsdevelopers.com/2019/08/26/vue-what-to-unit-test-components/)
- [How to unit test a vuex Store](https://www.dev-tips-and-tricks.com/how-to-unit-test-a-vuex-store)