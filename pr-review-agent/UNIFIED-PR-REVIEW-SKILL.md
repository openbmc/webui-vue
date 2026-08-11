# Unified PR Review Skill — webui-vue

A single, self-contained code-review skill for the **webui-vue** repository
(OpenBMC Web UI). It merges the general review process with every per-technology
review guide into one document an AI agent can load to review a Pull Request
end-to-end.

> Built from the collected stack in `package.json` + repo conventions, adapted
> from `awesome-skills/code-review-skill` (process + `reference/vue.md`) and the
> Anthropic `frontend-design` skill.

---

## 0. Technology inventory (what this repo uses)

| Area        | Technologies                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Framework   | Vue **3.5.24**, Vue Router **4.6.3**, Vuex **4.1.0**, Vue I18n **11.2.8**                         |
| Language    | TypeScript **5.9.3** (strict), JavaScript ES2020 (ESM)                                            |
| Data/API    | Axios **1.13.2** + axios-cache-interceptor, **@tanstack/vue-query 5.92.9**, **Redfish** (DMTF)    |
| Forms       | @vuelidate/core **2.0.3** + validators **2.0.4**                                                  |
| Styling     | Sass/SCSS **1.97.2**, Bootstrap **5.3.8**, bootstrap-vue-next **0.40.8**, Carbon icons            |
| Tooling     | Vite **6.4.1**, Vitest **3.2.4** + @vue/test-utils, ESLint **9.18.0** (flat) + Prettier **3.4.2** |
| Specialized | xterm (SOL), @novnc/novnc (KVM), date-fns(-tz), lodash, mitt (event bus), js-cookie               |

### Non-negotiable project facts

- Review happens in **Gerrit, not GitHub PRs**. Commits need `Signed-off-by` and
  a well-formed message (50-char imperative subject, body wrapped at 72).
- **Accessibility (WCAG AA)** and **i18n** are core requirements.
- **Theming-friendly** styles (no hardcoded colors). Node `>=18.18.0`.
- CI runs `format-code.sh` + ESLint after push to Gerrit.

---

## 1. Review process (always apply)

**Mindset:** catch bugs/edge cases, ensure maintainability, share knowledge,
enforce standards. Not: showing off, nitpicking formatting (linters do that), or
rewriting to preference. Feedback should be specific, actionable, educational,
and prioritized — ask questions instead of issuing commands.

### 4-phase flow

```text
Phase 1 — Context: read commit msg + linked issue; diff >400 lines? suggest split;
                    confirm CI/ESLint/format-code.sh pass; understand the BMC feature.
Phase 2 — High level: architecture fit · performance · file placement · test strategy;
                    route to the relevant technology sections below.
Phase 3 — Line by line: logic & edge cases · security (XSS, auth, secrets) ·
                    maintainability · reuse · a11y · i18n.
Phase 4 — Summary: concerns + praise + clear decision (Approve / Comment / Request changes).
```

**Severity labels** (use in every comment)

| 🔴 `[blocking]` | 🟠 `[important]` | 🟡 `[nit]` | 🔵 `[suggestion]` | 📚 `[learning]` | 🌟 `[praise]`       |
| --------------- | ---------------- | ---------- | ----------------- | --------------- | ------------------- |
| must fix        | should fix       | minor      | optional          | educational     | highlight good work |

**Let tooling own** formatting, import order, simple lint rules, typos
(Prettier + ESLint

- `format-code.sh`).

**Which sections to apply, by changed file**

| Changed files                  | Apply sections                             |
| ------------------------------ | ------------------------------------------ |
| `*.vue`                        | Vue 3, Accessibility (+ SCSS if `<style>`) |
| `*.ts`                         | TypeScript                                 |
| `src/store/**`                 | Vuex, Axios/Redfish                        |
| `src/router/**`, `routes.js`   | Vue Router                                 |
| `src/locales/**`, `$t()`       | Vue I18n                                   |
| `tests/**`, `*.spec.js`        | Testing                                    |
| `*.scss`, `<style>`            | SCSS/Bootstrap                             |
| `src/api/**`, `store/api.js`   | Axios/Redfish, TanStack Query              |
| `@vuelidate/*`, forms          | Vuelidate                                  |
| `vite.config.js`, `src/env/**` | Vite                                       |
| `eslint.config.js`             | ESLint/Prettier                            |

---

## 2. Universal gates (check on every PR)

- [ ] Commit message: `Signed-off-by` + 50/72 rule.
- [ ] No hardcoded user-facing strings — uses `$t()` / locale keys.
- [ ] No hardcoded colors/pixels that break theming — uses SCSS tokens.
- [ ] Accessible: labels, focus, ARIA, keyboard support.
- [ ] Tests added/updated; snapshots reviewed (not blindly regenerated).
- [ ] No secrets, tokens, or BMC credentials committed or logged.
- [ ] `npm run lint` clean; no stray `console.log`/`debugger`.
- [ ] Reuses existing composables/mixins/utils instead of duplicating.

---

## 3. Vue 3 (3.5)

Mixes Options API (most views) and Composition API (composables). Templates use
**kebab-case** components (ESLint enforced).

- Prefer `ref` for primitives; **never destructure `reactive()`** (use
  `toRefs`).
- `computed` must be **pure** (no side effects). Large objects → `shallowRef` +
  `triggerRef`.
- **Never mutate props** — emit to parent. Type props; factory defaults for
  objects/arrays.
- `watch` vs `watchEffect`: use `watch` for old value/lazy. Async watchers must
  clean up (`onCleanup`/`onWatcherCleanup` + `AbortController`). Prefer
  `computed` over watchers.
- Templates: stable unique `:key` (not index); no `v-if`+`v-for` on same node;
  move complex logic out of inline handlers.
- Composables return reactive refs (not `.value`); pass props via
  `toRef`/getter; clean up in `onUnmounted`.
- **Cleanup is a recurring bug source:** xterm, noVNC, `setInterval`,
  `addEventListener`, WebSockets, and `mitt` (`src/eventBus.js`) handlers must
  be removed on unmount.
- Perf: `defineAsyncComponent`, `v-memo`, `KeepAlive`, pagination/virtual scroll
  for large lists.

**Checklist:** no mutated props · no bare `reactive` destructure · pure
`computed` · stable keys · async watcher cleanup · timers/listeners/sockets
unmounted · kebab-case components · `$t()` for text.

---

## 4. TypeScript (5.9, strict)

Used in `src/api/**`, newer composables, `*.d.ts`. Alias `@/* → src/*`. Most
`.vue`/store files are JS — don't demand rewrites.

- No unjustified `any` (use `unknown` + narrowing); avoid non-null `!`.
- Type Redfish payloads (`RedfishCollection<T>`, `RedfishQueryParameters`).
  Preserve OData keys (`@odata.id`, `Members@odata.count`).
- **Encoding:** keep `$` OData directives unencoded; `encodeURIComponent` user
  values.
- `import type` for type-only imports (`isolatedModules` on). Use `@/` alias. No
  circular imports. Exported APIs get explicit return types; generics
  parameterized.

**Checklist:** no stray `any`/`!` · payloads typed · directives vs values
encoded correctly · `import type` · `@/` alias · explicit return types.

---

## 5. Vuex (4)

Store = **namespaced modules** by feature (`HardwareStatus/`, `Operations/`,
`Settings/`, `SecurityAndAccess/`, `Logs/`, `Authentication/`, `GlobalStore`)
registered in `src/store/index.js`.

- Module shape:
  `{ namespaced: true, state (fn), getters, mutations (SET_*), actions }`.
- **State mutated only in mutations.** Actions do async (Redfish via `api`),
  then `commit`; actions return promises.
- Errors: actions catch → log → re-throw a **translated** message so views can
  toast. No silent swallow.
- Derived state in getters, not components. No duplicate fetches of the same
  resource. Don't store sockets/terminals in Vuex.

**Checklist:** new module `namespaced` + registered · state only via `SET_*` ·
async in actions returning promises · translated error re-throw · no duplicated
fetching · tests/mocks updated.

---

## 6. Vue Router (4)

Routes in `src/router/routes.js`, wired in `index.js`; env override via
`CUSTOM_ROUTER`.

- Lazy-load route components; pick correct layout
  (`AppLayout`/`ConsoleLayout`/`LoginLayout`).
- `meta.title` is an **i18n key**, not literal. Auth/privilege guards on
  protected pages (`usePrivilegeCheck`). Update `AppNavigation` + breadcrumb.
  Validate/encode route params used in Redfish calls. Unknown routes →
  `PageNotFound`.

**Checklist:** lazy-loaded + correct layout · `meta.title` i18n key · guard on
protected/privileged pages · nav/breadcrumb updated · params validated · 404
fallback.

---

## 7. Vue I18n (11)

Locales in `src/locales/` (`en-US`, `ru-RU`, `ka-GE`). `npm run i18n:report`
checks missing/unused keys.

- **No hardcoded user-facing strings** — `$t('key')` in templates,
  `i18n.global.t('key')` in JS/store. Includes ARIA labels, tooltips, table
  headers, toasts, errors.
- Add keys to **`en-US.json`** (source of truth). Match the feature's key
  hierarchy. Use named interpolation (`{name}`) and plurals — **no string
  concatenation**.

**Checklist:** all text via `$t()` · keys in `en-US.json` · hierarchy matches ·
interpolation/ plurals not concatenation · `i18n:report` clean · ARIA/tooltips
translated.

---

## 8. Testing (Vitest + @vue/test-utils)

Tests in `tests/unit/`; `npm run test:unit`; coverage v8; snapshots via
`vue3-snapshot-serializer`.

- `import { vi, describe, it, expect, beforeEach } from 'vitest'`. Mount with
  `createStore({ actions, getters, modules })` via `global.plugins`. Mock
  `$t: (k) => k`. Stub `store.dispatch = vi.fn()` in `beforeEach`. **All
  referenced Vuex namespaces must exist** (add fake `{ namespaced: true }`).
- New behavior/bug fix **must** have tests (🟠 if missing). Snapshot diffs must
  be intentional, not blindly regenerated. Await `$nextTick()`/promises. Assert
  real outcomes (emitted events, rendered output), not just `exists()`. Reset
  spies between tests. Cover edge/error paths.

**Checklist:** behavior covered · snapshots intentional · async awaited ·
namespaces stubbed + `$t` mocked · spies reset · real assertions · edge cases.

---

## 9. SCSS / Bootstrap

Styles in `src/assets/styles/` (`bmc/`, `bootstrap/`, `_obmc-custom.scss`). Vite
injects helpers via `scssAdditionalData`. **Theming is core.**

- **No hardcoded hex colors / magic pixels** — use theme variables/tokens +
  Bootstrap utilities. Reuse Bootstrap / bootstrap-vue-next components before
  bespoke CSS.
- `<style scoped>` unless intentionally global (globals → styles layer). No
  duplicated mixins (helpers already imported). No unjustified `!important`.
  Respect `prefers-reduced-motion`. Responsive to mobile; AA contrast. SCSS
  formatted by Prettier.

**Checklist:** no hardcoded colors · reuses Bootstrap · scoped styles · no stray
`!important` · reduced-motion · responsive + AA contrast · no duplicated
helpers.

---

## 10. Axios / Redfish

Shared client `@/store/api` (Axios + cache interceptor). Backend = **Redfish**
(`/redfish/v1`), `BASE_URL` from `.env`. Typed composables in
`src/api/composables/`.

- OData params (`$expand`/`$filter`/`$select`/`$top`/`$skip` +
  `only`/`excerpt`): keep `$` directives **unencoded**, `encodeURIComponent`
  user values. Don't over-`$expand` large collections (BMC perf).
- **Never log/commit** tokens/cookies/passwords/credentials (auth via
  `js-cookie` + Authentication store). Validate/encode user-built path segments.
- Handle non-2xx → translated error + log (no silent catch). **Invalidate cached
  GETs after writes** (cache interceptor). Await/poll long-running BMC tasks
  (firmware, reboot, dumps). No duplicate requests.

**Checklist:** uses shared `api` · encoding correct · no secrets logged · errors
handled + translated · cache invalidated after writes · no over-expand · tasks
awaited · no dup fetches.

---

## 11. TanStack Vue Query (5)

Used by newer Redfish read composables (`useQuery`). Coexists with legacy
Vuex+Axios.

- **Stable, serializable query keys** including resource path + params. Pass
  reactive refs/ getters (don't read `.value` once). Use `enabled` to defer
  until auth/id ready.
- Handle `isLoading`/`isError` with translated messages. `invalidateQueries`
  after mutations. Tune `staleTime`/`gcTime` to resource volatility (inventory
  rarely changes; sensors often) to avoid hammering the BMC. Parallelize
  independent queries (no waterfalls). Don't double-cache in both Vuex and Vue
  Query.

**Checklist:** stable keys w/ params · reactive params · `enabled` guards ·
loading/error handled · invalidate after mutate · tuned cache times · no
double-cache · no waterfalls.

---

## 12. Vuelidate (2)

Form validation across Settings, SecurityAndAccess, ProfileSettings,
ChangePassword.

- Map fields to rules; reuse built-ins (`required`, `email`, `minLength`,
  `sameAs`, `helpers.regex`) before custom. **Translate** all messages. Bind
  invalid state to inputs.
- Guard submit with `v$.$invalid`; `$touch()` on blur/submit. Debounce async
  validators (e.g. uniqueness) — don't spam BMC. Confirm-password via `sameAs`;
  never log secrets. Expose errors to AT (`aria-invalid`, `aria-describedby`).
  `$reset()` on close/clear.

**Checklist:** constrained fields validated · built-ins reused · submit guarded
· messages translated · a11y error wiring · async debounced · reset on close ·
secrets not logged.

---

## 13. Vite (6)

Config `vite.config.js`. Node `>=18.18.0`.

- `@ → src` alias must match `tsconfig.json` paths. Custom
  `resolveDirectoryIndex` resolves folder imports to `index.js` — keep barrels.
  Env flags (`VITE_ENV_NAME`, `CUSTOM_STYLES/STORE/ ROUTER/APP_NAV`) swap
  `src/env/` files — review brand-build impact. SCSS helpers injected globally
  (don't re-import). No secrets in committed `.env*`. Justify plugin/bundle
  changes.

**Checklist:** alias synced with tsconfig · folder `index.js` barrels · no
duplicated SCSS helpers · no secrets in `.env*` · `src/env/**` impact reviewed ·
bundle changes justified.

---

## 14. ESLint / Prettier

ESLint 9 flat config (`eslint.config.js`) + eslint-plugin-vue +
@typescript-eslint; Prettier 3. Pre-commit `lint-staged`; CI `format-code.sh`.

- Tooling owns formatting/style. Repo notes: template components **kebab-case**;
  `multi-word-component-names` off; several `vue/*` rules TODO-disabled (flag
  those issues manually); `no-console` off (still question debug logs).
- PR passes `npm run lint` with no new warnings. No unjustified inline
  `eslint-disable`. Don't reformat unrelated files. No stray
  `console.log`/`debugger`.

**Checklist:** lint clean · no unjustified disables · kebab-case components · no
debug logs · no noisy reformatting · md/scss/json/yaml Prettier-clean.

---

## 15. Accessibility (WCAG AA — core requirement)

Apply to every `*.vue` change with user-facing markup.

- **Semantic HTML** (`<button>`, `<nav>`, `<table>`, ordered headings); no
  `<div @click>` controls. Every control **labeled** (icon-only → translated
  `aria-label`). Fully **keyboard** operable with visible focus + logical tab
  order.
- ARIA for state: `aria-invalid`/`aria-describedby` (errors),
  `aria-expanded`/`aria-controls` (disclosures), `aria-live` (async
  status/toasts). Meaningful `alt`; decorative hidden. **No color-only
  meaning**; AA contrast. Tables use `<th scope>`; status icons have text
  alternatives. Modals trap + restore focus. Respect `prefers-reduced-motion`.
  All a11y text translated. One `<h1>`/page; no skipped heading levels.

**Checklist:** semantic elements · labeled controls · keyboard + visible focus ·
error ARIA · live regions · alt text · no color-only · AA contrast ·
focus-managed modals · reduced-motion.
