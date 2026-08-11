# PR Review Skill (Refined) — webui-vue

A single, self-contained code-review skill for the **webui-vue** repository
(OpenBMC Web UI). It merges the review process with every per-technology guide
into one document an AI agent can load to review a Pull Request end-to-end.

> Refined per review feedback: no pinned versions, no tone/mindset section, and
> content already enforced by commit hooks / CI (commit-message format, lint,
> Prettier) is dropped to save tokens. Migration direction is called out so the
> reviewer understands where the codebase is heading.

---

## 0. Technology inventory

| Area        | Technologies                                                                        |
| ----------- | ----------------------------------------------------------------------------------- |
| Framework   | Vue 3, Vue Router, Vuex, Vue I18n                                                   |
| Language    | TypeScript (strict), JavaScript (ESM)                                               |
| Data/API    | Axios + axios-cache-interceptor, @tanstack/vue-query, **Redfish** (DMTF)            |
| Forms       | @vuelidate/core + validators                                                        |
| Styling     | Sass/SCSS, Bootstrap, bootstrap-vue-next, Carbon icons                              |
| Tooling     | Vite, Vitest + @vue/test-utils, ESLint (flat) + Prettier                            |
| Specialized | xterm (SOL), @novnc/novnc (KVM), date-fns(-tz), lodash, mitt (event bus), js-cookie |

### Migration in progress (understand the direction)

The codebase is mid-migration. When reviewing, prefer the **target** patterns
for new code and don't force old patterns onto new work:

- **State:** Vuex → **Pinia** + **Vue Query / composables**. New data access
  should trend toward `@tanstack/vue-query` composables (`src/api/composables/`)
  rather than new Vuex modules. Existing Vuex is legacy-but-supported.
- **Components:** **Options API → Composition API** (`<script setup>`). New
  components should use Composition API; existing Options API components are
  fine to keep.
- **Utilities:** Mixins (`src/components/Mixins/`) → **composables**
  (`src/components/ Composables/`). Prefer the composable equivalent (e.g.
  `useDataFormatter` over `DataFormatterMixin`); don't add new mixins (see §16).
- **Redfish-first (see §3):** keep RF objects in **PascalCase** and use them
  **directly** in `.vue` files — don't recast Redfish payloads into camelCase JS
  view-models.
- **Types:** _(placeholder — plan not finalized)_ a move toward **generated
  OpenAPI types** (`openapi.ts`) instead of hand-written Redfish types
  (`src/api/types/redfish.ts`) is under consideration. Don't enforce yet; this
  section will be fleshed out once the plan lands.
- Don't block a PR solely for using the legacy pattern in existing files, but
  nudge new code toward the target.

**Non-negotiable project facts**

- Backend is **Redfish** (DMTF) over `/redfish/v1`.
- **Accessibility (WCAG AA)** and **i18n** are core requirements.
- **Theming-friendly** styles — no hardcoded colors.

---

## 1. Review flow

```
Phase 1 — Context: read commit msg + linked issue; diff >400 lines? suggest split;
                    understand the BMC feature.
Phase 2 — High level: architecture fit · performance · file placement · test strategy;
                    route to the relevant technology sections below.
Phase 3 — Line by line: logic & edge cases · security (XSS, auth, secrets) ·
                    maintainability · reuse · a11y · i18n.
Phase 4 — Summary: concerns + praise + clear decision (Approve / Comment / Request changes).
```

**Severity labels**

| 🔴 `[blocking]` | 🟠 `[important]` | 🟡 `[nit]` | 🔵 `[suggestion]` | 📚 `[learning]` | 🌟 `[praise]`       |
| --------------- | ---------------- | ---------- | ----------------- | --------------- | ------------------- |
| must fix        | should fix       | minor      | optional          | educational     | highlight good work |

**Which sections to apply, by changed file**

| Changed files                                 | Apply sections                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `*.vue` (new page)                            | Vue 3, Global Components & Page anatomy, Accessibility, Motion (+ SCSS if `<style>`) |
| `*.vue` (existing)                            | Vue 3, Accessibility (+ SCSS if `<style>`)                                           |
| `*.ts`                                        | TypeScript                                                                           |
| `src/store/**`                                | Vuex, Axios/Redfish                                                                  |
| `src/router/**`, `routes.js`                  | Vue Router                                                                           |
| `src/locales/**`, `$t()`                      | Vue I18n                                                                             |
| `tests/**`, `*.spec.js`                       | Testing                                                                              |
| `*.scss`, `<style>`                           | SCSS/Bootstrap, Motion                                                               |
| `src/api/**`, `store/api.js`                  | Axios/Redfish, TanStack Query                                                        |
| `@vuelidate/*`, forms                         | Vuelidate                                                                            |
| `vite.config.js`, `src/env/**`                | Vite                                                                                 |
| Any user input, URLs, auth, `v-html`, uploads | Security                                                                             |
| `src/components/Composables/**`, `Mixins/**`  | Composables & Mixins                                                                 |
| `src/components/Global/**`                    | Global Components & Page anatomy                                                     |
| Dates/timestamps, `date-fns`, timezones       | Date, time & formatting                                                              |
| `xterm`, `novnc`, console, `NBDServer.js`     | Console & KVM                                                                        |
| Toasts, loading, `useToast`, `useLoadingBar`  | Error handling & feedback                                                            |

> Skip formatting, import order, lint rules, commit-message format, and Prettier
> — commit hooks and CI already enforce these. Don't spend review tokens on
> them.

---

## 2. Universal gates (check on every PR)

- [ ] No hardcoded user-facing strings — uses `$t()`/`$tc()` / locale keys; keys
      alphabetized.
- [ ] No hardcoded colors/pixels that break theming — uses SCSS tokens.
- [ ] Accessible: labels, focus, ARIA, keyboard support; a11y tool run on
      changed pages.
- [ ] Tests added/updated; snapshots reviewed (not blindly regenerated).
- [ ] No secrets, tokens, or BMC credentials committed or logged.
- [ ] Reuses existing composables / Global components instead of reinventing.
- [ ] New code follows migration target (Composition API; Pinia/Vue Query over
      new Vuex).
- [ ] Redfish-first: RF objects kept in PascalCase and used directly, not recast
      to JS view-models.
- [ ] Security: no unsafe `v-html`; user-built URLs/params validated + encoded;
      no secrets logged/persisted.
- [ ] Failures surfaced with a translated toast; loading state shown; no silent
      failure.
- [ ] New page uses standard `<b-container fluid="xl">` + `<page-title>` +
      `<page-section>` anatomy.

---

## 3. Vue 3

Modern AI models already know Vue 3 well — **follow modern Vue 3 conventions**
(see the official guide: <https://vuejs.org/guide/> and style guide:
<https://vuejs.org/style-guide/>). Don't re-review generic Vue rules the linter
and the model already handle. Only the **project-specific** points below are
worth calling out.

- Mixes Options API (legacy) and Composition API. **New components: prefer
  `<script setup>` Composition API.**
- Templates use **kebab-case** component names (repo ESLint rule).
- **Cleanup is a recurring bug source here:** xterm (SOL), noVNC (KVM),
  `setInterval`, `addEventListener`, WebSockets, and `mitt` (`src/eventBus.js`)
  handlers **must** be removed in `onUnmounted`/`beforeUnmount`. Leaked handlers
  in console/KVM views are a known issue.
- **i18n:** all user-facing text via `$t()` (see §7). **Theming:** no hardcoded
  colors (see §9). **A11y:** see §14.
- **Redfish-first:** bind Redfish objects/properties directly in templates in
  PascalCase (see §3.1) rather than mapping them to local camelCase state.

**Checklist:** new code in Composition API · kebab-case components ·
timers/listeners/ sockets/event-bus handlers cleaned up on unmount · `$t()` for
text · RF used directly.

### 3.1 Redfish-first approach

Treat Redfish as the primary data shape end-to-end instead of translating it
into a separate JavaScript view-model layer.

- **Keep PascalCase** for Redfish objects and properties (`Status.Health`,
  `PowerState`, `Members`, `@odata.id`) — do **not** rename to camelCase.
- **Don't recast/transform** RF objects into bespoke JS view-models in the store
  just to rename or reshape fields. Avoid mapping layers that only exist to
  camelCase the payload.
- **Use RF objects directly in `.vue` files** — read the Redfish properties
  straight from the fetched resource (pairs naturally with Vue Query /
  composables, §11).
- Preserve OData keys (`@odata.id`, `@odata.type`, `Members@odata.count`) rather
  than stripping them.
- Legacy stores that already map RF → camelCase are supported; don't force a
  refactor, but new code should follow the Redfish-first pattern.

**Checklist:** RF properties in PascalCase · no gratuitous RF→JS view-model
mapping · RF read directly in components · OData keys preserved.

---

## 4. TypeScript (strict)

Used in `src/api/**`, newer composables, `*.d.ts`. Alias `@/* → src/*`. Most
`.vue`/store files are JS — don't demand rewrites.

- No unjustified `any` (use `unknown` + narrowing); avoid non-null `!`.
- Type Redfish payloads (`RedfishCollection<T>`, `RedfishQueryParameters`) with
  **PascalCase** properties. Preserve OData keys (`@odata.id`,
  `Members@odata.count`); don't rename to camelCase (Redfish-first, §3.1). _(A
  future move to generated OpenAPI types / `openapi.ts` is under consideration —
  not enforced yet.)_
- **Encoding:** keep `$` OData directives unencoded; `encodeURIComponent` user
  values.
- `import type` for type-only imports (`isolatedModules` on). Use `@/` alias. No
  circular imports. Exported APIs get explicit return types; generics
  parameterized.

**Checklist:** no stray `any`/`!` · payloads typed · directives vs values
encoded correctly · `import type` · `@/` alias · explicit return types.

---

## 5. Vuex (legacy — migrating to Pinia / Vue Query)

Store = **namespaced modules** by feature registered in `src/store/index.js`.
Existing Vuex is supported, but **new state should prefer Pinia or Vue Query
composables**.

- Module shape:
  `{ namespaced: true, state (fn), getters, mutations (SET_*), actions }`.
- **State mutated only in mutations.** Actions do async (Redfish via `api`),
  then `commit`; actions return promises.
- Errors: actions catch → log → re-throw a **translated** message so views can
  toast. No silent swallow.
- Derived state in getters, not components. No duplicate fetches of the same
  resource. Don't store sockets/terminals in Vuex.

**Checklist:** (for legacy changes) state only via `SET_*` · async in actions
returning promises · translated error re-throw · no duplicated fetching ·
tests/mocks updated. (For new state) prefer Pinia / Vue Query.

---

## 6. Vue Router

Routes in `src/router/routes.js`, wired in `index.js`; env override via
`CUSTOM_ROUTER`.

- Lazy-load route components; pick correct layout
  (`AppLayout`/`ConsoleLayout`/`LoginLayout`).
- `meta.title` is an **i18n key**, not literal. Auth/privilege guards on
  protected pages (`usePrivilegeCheck`). Update `AppNavigation` + breadcrumb.
  Validate/encode route params used in Redfish calls. Unknown routes →
  `PageNotFound`.

**Checklist:** lazy-loaded + correct layout · `meta.title` i18n key · guard on
protected/ privileged pages · nav/breadcrumb updated · params validated · 404
fallback.

---

## 7. Vue I18n

Locales in `src/locales/` (`en-US`, `ru-RU`, `ka-GE`).

- **No hardcoded user-facing strings** — `$t('key')` in templates,
  `i18n.global.t('key')` in JS/store. Includes ARIA labels, tooltips, table
  headers, toasts, errors.
- Add keys to **`en-US.json`** (source of truth). Run `npm run i18n:report` to
  confirm no missing or orphaned keys.

### Key naming convention (from project docs)

- **Page-specific keys** nested under `page` + page title:
  `pageLocalUserManagement.editUser`.
- **Child components** (tables, modals) nested inside the page object:
  `pageEventLogs.table.eventType`.
- **Global/shared** keys under `global.*` (e.g. `global.action.cancel`).
- **Alphabetize** keys within every object — makes keys easier to locate and
  avoids duplicates.
- **Plurals** via `$tc()` (not `$t()`): `$tc('pageDumps.modal.deleteDump')` maps
  to `"Delete dump | Delete dumps"` in the locale file.
- Use named interpolation (`{name}`) not string concatenation; avoid complex
  linked messages.

### Vendor overlays

Environment-specific overrides can supply extra locale files under
`src/env/locales/`. New keys needed only for a brand build go there — don't add
them to base locales.

**Checklist:** all text via `$t()`/`$tc()` · keys in `en-US.json` +
`i18n:report` clean · `page`-prefixed hierarchy · keys alphabetized · plurals
via `$tc()` · ARIA/tooltips translated · no string concatenation.

---

## 7a. Global Components & Page anatomy

Every new page **must** follow the standard page anatomy using components from
`src/components/Global/`. This is a firm project convention.

### Required page structure

```vue
<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageName.sectionTitle')">
      <!-- content -->
    </page-section>
  </b-container>
</template>
```

- `<b-container fluid="xl">` — standard page wrapper.
- `<page-title>` — renders the page heading; accepts optional `:description`
  prop (i18n key).
- `<page-section>` — groups related content; `:section-title` is an i18n key.

### Standard Global components — must be reused, not reinvented

| Component                                         | Use for                                                                 |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| `PageTitle` / `PageSection`                       | Every page heading and section                                          |
| `StatusIcon`                                      | Health/status display (use with `statusIcon()` from `useDataFormatter`) |
| `Alert`                                           | Inline page-level alerts                                                |
| `AccessDeniedAlert`                               | Show when `usePrivilegeCheck` denies access                             |
| `ConfirmModal`                                    | Destructive-action confirmation dialogs                                 |
| `InfoTooltip`                                     | Explanatory tooltips                                                    |
| `InputPasswordToggle`                             | Password fields with show/hide toggle                                   |
| `Search`                                          | Filterable table search input                                           |
| `TableToolbar` / `TableFilter` / `TableRowAction` | Table chrome                                                            |
| `LoadingBar`                                      | Page-level loading indicator                                            |
| `FormFile`                                        | File upload input                                                       |

Before writing a custom component for any of the above use cases, **use the
Global one**.

### StatusIcon convention

Never create ad-hoc status indicators. Use
`<status-icon :status="statusIcon(health)">` where `statusIcon()` comes from
`useDataFormatter()`. The mapping is: `'OK' → 'success'`,
`'Warning' → 'warning'`, `'Critical' → 'danger'`.

**Checklist:** new page uses `<b-container fluid="xl">` + `<page-title>` +
`<page-section>` · Global components reused · `<status-icon>` + `statusIcon()`
for health display.

---

## 8. Testing (Vitest + @vue/test-utils)

Tests in `tests/unit/`; snapshots via `vue3-snapshot-serializer`.

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

Styles in `src/assets/styles/`. Vite injects helpers via `scssAdditionalData`.
**Theming is core.**

- **No hardcoded hex colors / magic pixels** — use theme variables/tokens +
  Bootstrap utilities. Reuse Bootstrap / bootstrap-vue-next components before
  bespoke CSS.
- `<style scoped>` unless intentionally global (globals → styles layer). No
  duplicated mixins (helpers already imported). No unjustified `!important`.
  Respect `prefers-reduced-motion`. Responsive to mobile; AA contrast.

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

## 11. TanStack Vue Query (migration target for reads)

Used by newer Redfish read composables (`useQuery`). Prefer this over new Vuex
for read-heavy data.

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

## 12. Vuelidate

Form validation across Settings, SecurityAndAccess, ProfileSettings,
ChangePassword.

- `<b-form>` **must** have `novalidate` to disable native browser HTML5
  validation — Vuelidate handles all validation; native and Vuelidate messages
  will conflict otherwise.
- Map fields to rules; reuse built-ins (`required`, `email`, `minLength`,
  `sameAs`, `helpers.regex`) before custom. **Translate** all messages. Use
  `<b-form-invalid-feedback>` to surface them; bind `<b-form-group>` `:state` to
  `getValidationState(v$.field)`.
- Guard submit with `v$.$invalid`; `$touch()` on blur/submit. Debounce async
  validators (e.g. uniqueness) — don't spam BMC. Confirm-password via `sameAs`;
  never log secrets. Expose errors to AT (`aria-invalid`, `aria-describedby`).
  `$reset()` on close/clear.

**Checklist:** `novalidate` on `<b-form>` · constrained fields validated ·
built-ins reused · submit guarded · `<b-form-invalid-feedback>` used · messages
translated · a11y error wiring · async debounced · reset on close · secrets not
logged.

---

## 13. Vite

Config `vite.config.js`.

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

## 14. Accessibility (WCAG AA — core requirement)

Apply to every `*.vue` change with user-facing markup.

### Two ARIA rules (from project docs — these are absolute)

1. **Always favour semantic HTML over ARIA.** Use `<button>`, `<nav>`,
   `<table>`, `<label>` before reaching for ARIA roles/attributes.
2. **No ARIA is better than bad ARIA.** A missing attribute causes a silent gap;
   a wrong one actively misleads assistive technology.

### Review points

- **Semantic HTML:** no `<div @click>` controls; ordered headings; one `<h1>`
  per page.
- Every control **labeled** — icon-only buttons/links need a translated
  `aria-label`.
- Fully **keyboard operable:** visible focus indicator; logical tab order; no
  keyboard traps (except intentional modal focus traps).
- **ARIA for state:** `aria-invalid`/`aria-describedby` (form errors),
  `aria-expanded`/ `aria-controls` (disclosures), `aria-live` regions (async
  status updates, toasts).
- **Images/icons:** meaningful `alt`; decorative set `alt=""` /
  `aria-hidden="true"`.
- **Color:** no color-only meaning; WCAG AA contrast (4.5:1 text, 3:1 large
  text/UI).
- **Tables:** `<th scope>` headers; use `<status-icon>` which includes a text
  alternative.
- **Modals:** trap focus on open; return focus to trigger on close.
- **Motion:** respect `prefers-reduced-motion`; use Carbon motion tokens for any
  custom animation (see §14a).
- All a11y text (`aria-label`, `alt`, ARIA descriptions) **translated** via
  `$t()`.

### A11y testing (project mandated)

Developers must run at least one automated a11y tool on changed pages:

- **[Deque Axe](https://www.deque.com/axe/)** (browser extension)
- **[Lighthouse](https://developers.google.com/web/tools/lighthouse)** (bundled
  in Chrome DevTools)
- **[IBM Accessibility Tools](https://www.ibm.com/able/toolkit/tools)**

**Checklist:** semantic elements · no ARIA where semantic HTML suffices ·
labeled controls · keyboard + visible focus · error ARIA · live regions · alt
text · no color-only · AA contrast · focus-managed modals · reduced-motion ·
a11y tool run on changed pages.

---

## 14a. Motion & animation

Project motion guidelines follow the **Carbon Design System**. Use the defined
tokens; don't pick arbitrary durations or easing curves.

### Easing tokens (use in CSS transitions/animations)

```scss
// Productive (task-focused, subtle)
$standard-easing--productive: cubic-bezier(0.2, 0, 0.38, 0.9);
$entrance-easing--productive: cubic-bezier(0, 0, 0.38, 0.9);
$exit-easing--productive: cubic-bezier(0.2, 0, 1, 0.9);
// Expressive (significant moments — use sparingly)
$standard-easing--expressive: cubic-bezier(0.4, 0.14, 0.3, 1);
```

### Duration tokens

```scss
$duration--fast-01: 70ms; // micro-interactions (button, toggle)
$duration--fast-02: 110ms; // fade micro-interactions
$duration--moderate-01: 150ms; // small expansion, short distance
$duration--moderate-02: 240ms; // expansion, toast
$duration--slow-01: 400ms; // large expansion, important notifications
```

- Use **productive motion** for task-focused UI (navigation, form responses).
- Use **expressive motion** sparingly — page-open, primary CTA, notifications.
- All animations must respect `prefers-reduced-motion` (wrap in `@media`).

**Checklist:** Carbon easing tokens used · Carbon duration tokens used ·
productive vs expressive motion appropriate · `prefers-reduced-motion` media
query applied.

---

## 15. Security (review-critical for a BMC)

BMC web UIs are high-value targets — security review is mandatory, not optional.

- **XSS:** avoid `v-html`; if truly unavoidable, sanitize and justify. Never
  inject unsanitized Redfish/user data as raw HTML — prefer text interpolation.
- **Auth & sessions:** tokens/session cookies handled only via the
  Authentication store + `js-cookie`; never keep credentials in Vuex state,
  `localStorage`, logs, or the URL.
- **Sensitive data:** don't `console.log` responses containing tokens,
  passwords, keys, or certificates; redact in error handling.
- **URL injection / SSRF:** validate + encode any path segment or query value
  built from user input before calling `/redfish/v1/...` (see §4 encoding
  rules).
- **Privilege enforcement:** use `usePrivilegeCheck` for UX gating — but
  understand that **this is UX-only**; the backend (bmcweb) always validates
  privileges independently. Never rely on hiding a UI element as a security
  control. Roles: `Administrator` (full access), `Operator`
  (`hasOperatorOrAbove`), `ReadOnly` (`isReadOnly`). Use `<AccessDeniedAlert>`
  to show restricted-access pages gracefully instead of a blank page.
- **Uploads** (firmware, certs, SSH keys): validate type/size; don't trust
  filename.
- **Console/KVM credentials:** WebSocket/console tokens must not be logged or
  persisted.

**Checklist:** no unsafe `v-html` · secrets never logged/persisted/in-URL ·
user-built URLs/params validated + encoded · `usePrivilegeCheck` for UX only
(not security) · correct role tier used · `<AccessDeniedAlert>` shown for
restricted pages · uploads validated.

---

## 16. Composables & Mixins

Shared logic lives in `src/components/Composables/` (target) and
`src/components/Mixins/` (legacy). **Reuse an existing composable before writing
new logic** (supports the reuse gate).

Existing composables to reuse: `useDataFormatter`, `useToast`, `useLoadingBar`,
`usePrivilegeCheck`, `useSensors`, `useTableFilter`, `useTableSelection`,
`usePowerControl`.

- **Mixins are legacy** → use the composable equivalent (`DataFormatterMixin` →
  `useDataFormatter`, `BVToastMixin` → `useToast`, `LoadingBarMixin` →
  `useLoadingBar`, `VuelidateMixin`, `LocalTimezoneLabelMixin`, table mixins,
  etc.). **Don't add new mixins.**
- Composables return reactive refs (not `.value`); use `useXxx` naming; clean up
  side effects on unmount; keep them single-purpose.
- Don't duplicate an existing composable's behavior — extend or reuse it.

**Checklist:** reuses existing composable when one exists · new shared logic is
a composable, not a mixin · `useXxx` naming · reactive returns · side effects
cleaned up.

---

## 17. Date, time & data formatting

Uses `date-fns` + `date-fns-tz`; timezone handling (`LocalTimezoneLabelMixin` /
DateTimeStore); empty/placeholder + numeric formatting via `useDataFormatter`.

- Format dates with `date-fns`; handle timezones explicitly with `date-fns-tz` —
  BMC logs are usually UTC, display in the user's selected timezone.
- Use `useDataFormatter` for consistent empty rendering (`--` for
  null/undefined/empty) and numeric rounding; don't reinvent per component.
- Map status → icon via `useDataFormatter().statusIcon`, not ad-hoc maps.
- Don't hand-roll locale-specific date strings — respect i18n and the timezone
  preference.

**Checklist:** dates via date-fns(-tz) · timezone explicit (UTC→local) · empty
values via `useDataFormatter` (`--`) · shared status/icon mapping · no ad-hoc
locale date strings.

---

## 18. Console & KVM (SOL / virtual media)

Serial-over-LAN uses **xterm** (+ attach/fit addons); KVM uses **@novnc/novnc**;
virtual media/NBD uses `src/utilities/NBDServer.js`. These are WebSocket- and
resource-heavy.

- **Lifecycle/cleanup is critical:** dispose the terminal/RFB instance, close
  WebSockets, and remove resize/attach listeners in
  `onUnmounted`/`beforeUnmount`. Leaks here degrade the BMC session and are a
  known bug source.
- Use the `ConsoleLayout`; handle connect/disconnect/error states in the UI
  (translated).
- Don't log console/KVM auth tokens or session URLs (see §15). Back off on
  reconnect failure.

**Checklist:** terminal/RFB/WebSocket disposed on unmount · listeners removed ·
connect/error states handled + translated · no token logging · reconnect
backoff.

---

## 19. Error handling, toasts & loading UX

Consistent feedback via `useToast` (`BVToastMixin` legacy), `useLoadingBar`
(`LoadingBarMixin`), and the `mitt` event bus (`src/eventBus.js`) for page
refresh.

- Surface failures with a **translated** toast — never fail silently. Confirm
  success actions with a toast where the user expects feedback.
- Show loading state via `useLoadingBar` for async page/data operations.
- Store actions throw translated errors (§5); views catch and toast — keep error
  messaging in **one** layer, not duplicated in both store and component.
- Handle empty / error / loading states, not just the happy path.

**Checklist:** failures toasted + translated · loading indicated · success
feedback where expected · single error-messaging layer · empty/error/loading
states covered.
