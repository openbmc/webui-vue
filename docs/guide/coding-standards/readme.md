# Overview
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

To test all files for linting, run `npm run lint`. This command will evaluate the syntax of all files and update any code that that does not require manual review.

The code is also tested for compliance when code is checked-in and when the CI tool runs the build. There is a shell script named `format-code.sh` that runs the `npm ci` and `npm run lint` commands in your CI.