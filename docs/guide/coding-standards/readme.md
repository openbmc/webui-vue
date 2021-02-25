# JavaScript and SASS
This project uses the following libraries to determine the best practices and guidelines for both SCSS and JavaScript syntax.
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [ESLint Plugin for Vue](https://eslint.vuejs.org/)

The guidelines we are following are:
- [Vue Recommended](https://eslint.vuejs.org/rules/#priority-c-recommended-minimizing-arbitrary-choices-and-cognitive-overhead-for-vue-js-3-x)
- [ESLint Recommended](https://eslint.org/docs/rules/)
- [Prettier](https://prettier.io/docs/en/options.html)

The rules are applied in the following order:
1. Vue rules
1. ESLint recommended
1. Prettier

## Overrides
Any overrides to a rule are located in the ESLint configuration file, `.eslintrc.js`, located in the root directory.

## Running the lint test
To test all files for linting, run `npm run lint`. This command will evaluate the syntax of all files and update any code that that does not require manual review.

The linting script runs when code is committed,  during pre-commit, and when the CI tool runs after a push to Gerrit. There is a shell script named `format-code.sh` that installs node package dependencies and runs the test script in your CI.