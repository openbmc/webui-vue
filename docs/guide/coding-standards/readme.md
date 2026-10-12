# Linting and formatting

ESLint checks JavaScript, TypeScript, and Vue. Prettier's rules are enforced on
those files by ESLint. Prettier itself formats Markdown, JSON, YAML, and SCSS.
This repo has no SCSS linter. SCSS structure is covered in the
[customization guide](/customization/).

## ESLint

The flat config is `eslint.config.js`. Later blocks override earlier ones.

1. [@eslint/js recommended](https://eslint.org/docs/latest/use/configure/configuration-files).
   `no-console` is off. `no-debugger` is an error when `NODE_ENV` is
   `production`. `no-duplicate-imports` is an error. `no-unused-vars` is an
   error, and names matching `^_` are ignored for arguments, variables, and
   caught errors.
2. [eslint-plugin-vue `flat/recommended`](https://eslint.vuejs.org/user-guide/)
   for Vue files. Template component names must be kebab-case
   (`vue/component-name-in-template-casing`). These Vue rules are off:
   `vue/multi-word-component-names`, `vue/no-deprecated-filter`,
   `vue/no-useless-template-attributes`, `vue/no-deprecated-props-default-this`,
   `vue/no-reserved-component-names`, `vue/no-unused-components`,
   `vue/no-deprecated-delete-set`, and `vue/no-required-prop-with-default`.
3. [@typescript-eslint recommended](https://typescript-eslint.io/users/configs#recommended)
   for `.ts` and `.tsx`. On those files, core rules that TypeScript already
   checks are turned off. `no-unused-vars` uses the same `^_` ignore patterns.
   `<script lang="ts">` blocks use the TypeScript parser.
4. [Vitest recommended](https://github.com/vitest-dev/eslint-plugin-vitest) for
   unit specs. `vitest/expect-expect` and `vitest/no-disabled-tests` are
   warnings. `vitest/no-identical-title`, `vitest/no-focused-tests`, and
   `vitest/valid-expect` are errors.

`eslint-config-prettier` then turns off ESLint rules that conflict with
Prettier. `prettier/prettier` is an error, and it reads `.prettierrc.yaml`.

## Prettier

`.prettierrc.yaml` sets a print width of 80, single quotes, and wrapped prose.

- JSON and YAML use a 4-space indent.
- Markdown uses a 2-space indent.
- JavaScript, TypeScript, and Vue use a 2-space indent and trailing commas.
  OpenBMC CI's Prettier check does not format these files.
- SCSS is not in that override, so Prettier formats it with the 4-space root
  settings.

## Running lint

`npm run lint` runs `eslint src tests`. It reports problems and does not rewrite
files. Run `npx eslint --fix` on the paths you want to correct.

## Pre-commit hooks

`simple-git-hooks` runs `lint-staged` before each commit. `npm install` installs
the hooks through the `prepare` script. Run `npm run prepare` to install them
again.

- Staged `*.{js,ts,tsx,vue}` files are checked with `eslint --fix`.
- Staged `*.{md,scss}` files are formatted with `prettier --write`.

## CI

OpenBMC CI formats JSON, Markdown, and YAML with Prettier, using this repo's
`.prettierrc.yaml`, and fails if that changes the tree. It also runs
markdownlint on Markdown, using OpenBMC's default config because this repo has
no `.markdownlint.yaml`.

It then runs this repo's `format-code.sh`. That script runs `npm install` and
`npm run lint`, restores `package-lock.json`, and fails if ESLint reports an
error or any other file changed. The ESLint run covers JavaScript, TypeScript,
and Vue under `src/` and `tests/`.
