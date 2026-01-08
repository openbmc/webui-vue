# JavaScript and SASS

This project uses the following libraries to determine the best practices and
guidelines for both SCSS and JavaScript syntax.

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

Any overrides to a rule are located in the ESLint configuration file,
`.eslintrc.cjs`, located in the root directory.

## Prettier Configuration

Prettier settings are defined in `.prettierrc.yaml` in the root directory. This
configuration is used for formatting markdown, JSON, and YAML files. JavaScript
and Vue files use the prettier settings defined in the ESLint configuration.

## Running the lint test

To test all files for linting, run `npm run lint`. This command will evaluate
the syntax of all files and update any code that does not require manual review.

## Pre-commit Hooks

The project uses `simple-git-hooks` and `lint-staged` to automatically run
linting before each commit:

- JavaScript and Vue files are checked with `eslint --fix`
- Markdown files are formatted with `prettier --write`

Hooks are automatically installed when you run `npm install`. If you need to
reinstall them manually, run `npm run prepare`.

## CI Validation

The CI tool runs additional validation after a push to Gerrit using the
`format-code.sh` script, which checks formatting for JavaScript, Vue, markdown,
JSON, and YAML files.
