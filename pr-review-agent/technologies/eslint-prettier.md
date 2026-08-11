# ESLint / Prettier Review Skill — webui-vue

**ESLint 9.18.0** (flat config: `eslint.config.js`) + **eslint-plugin-vue 10**,
**@vitest/eslint-plugin**, **eslint-config-prettier**, plus
`@typescript-eslint`. **Prettier 3.4.2** formats md/json/yaml/scss. Pre-commit
runs `lint-staged` (`eslint --fix` on `*.{js,vue}`, `prettier --write` on
`*.{md,scss}`). CI runs `format-code.sh` after push to Gerrit.

## What tooling owns (don't review manually)

- Formatting, indentation, quotes, semicolons → Prettier / `format-code.sh`.
- Most style rules → ESLint recommended + `flat/recommended` Vue rules.

## Repo-specific rule notes (from `eslint.config.js`)

- Template component names must be **kebab-case**
  (`vue/component-name-in-template-casing: ['error','kebab-case']`).
- `vue/multi-word-component-names` is **off** (single-word component names
  allowed).
- Several `vue/*` rules are temporarily disabled with
  `// TODO: Fix in follow-up PR` (e.g. `no-unused-components`,
  `no-reserved-component-names`). Don't rely on these to catch issues — flag
  them in review manually.
- `no-console` is **off** — but still question noisy/debug `console.log` left in
  production paths (🟡).

## Review points

- PR should pass `npm run lint` with no new warnings/errors (CI will enforce).
- Don't disable ESLint rules inline (`// eslint-disable`) without a clear
  justification.
- Don't reformat unrelated files (creates noisy diffs); let lint-staged handle
  touched files.
- New TODO-disabled rules shouldn't be added casually — fix the root cause
  instead.
- Leftover `console.log`/`debugger` in shipping code → flag.

## Review checklist

- [ ] `npm run lint` clean; no new ESLint errors/warnings.
- [ ] No unjustified inline `eslint-disable`.
- [ ] Components referenced in templates use kebab-case.
- [ ] No stray `console.log`/`debugger` in production code paths.
- [ ] No unrelated reformatting / noisy whitespace diffs.
- [ ] md/scss/json/yaml Prettier-clean (matches `format-code.sh`).
