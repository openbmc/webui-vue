# PR Review Agent — Knowledge Base

This folder is the **data collection** stage for building an AI Agent (Copilot
Skill / custom MCP instructions) that reviews Pull Requests for the
**webui-vue** repository (OpenBMC Web UI).

The agent's knowledge is split into two layers:

1. **General code-review process** — how to review, severity labels, the 4-phase
   flow.
2. **Per-technology review skills** — one file per technology used in this repo,
   each containing the patterns, anti-patterns, and a review checklist for that
   tech.

> Reference sources used to build these skills:
>
> - <https://github.com/awesome-skills/code-review-skill> (core process +
>   `reference/vue.md`)
> - <https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md>

---

## How to use

| File                                                   | Purpose                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| [00-code-review-process.md](00-code-review-process.md) | Always loaded. Review mindset, 4-phase process, severity labels. |
| [technologies/](technologies/)                         | Loaded on demand based on which files a PR touches.              |

**Routing rule** — load the technology guide(s) that match the changed files:

| Changed file pattern              | Load                                                                       |
| --------------------------------- | -------------------------------------------------------------------------- |
| `*.vue`                           | `vue3.md`, `accessibility.md` (+ `scss-bootstrap.md` if `<style>` changed) |
| `*.ts`, `*.tsx`                   | `typescript.md`                                                            |
| `src/store/**`                    | `vuex.md`                                                                  |
| `src/router/**`, `routes.js`      | `vue-router.md`                                                            |
| `src/locales/**`, `$t(...)` usage | `vue-i18n.md`                                                              |
| `tests/**`, `*.spec.js`           | `testing-vitest.md`                                                        |
| `*.scss`, `<style>` blocks        | `scss-bootstrap.md`                                                        |
| `src/api/**`, `src/store/api.js`  | `axios-redfish.md`                                                         |
| `useQuery`, `@tanstack/vue-query` | `tanstack-vue-query.md`                                                    |
| `@vuelidate/*`, form validation   | `vuelidate.md`                                                             |
| `vite.config.js`, build config    | `vite.md`                                                                  |
| `eslint.config.js`, `.prettierrc` | `eslint-prettier.md`                                                       |

---

## Technology inventory (collected from `package.json`)

### Core framework

| Technology     | Version | Role                                              |
| -------------- | ------- | ------------------------------------------------- |
| **Vue 3**      | 3.5.24  | UI framework (Options API + Composition API mix)  |
| **Vue Router** | 4.6.3   | Client-side routing                               |
| **Vuex**       | 4.1.0   | Centralized state management (namespaced modules) |
| **Vue I18n**   | 11.2.8  | Internationalization (en-US, ru-RU, ka-GE)        |

### Language & types

| Technology           | Version | Role                                                           |
| -------------------- | ------- | -------------------------------------------------------------- |
| **TypeScript**       | 5.9.3   | Typed code in `src/api/**`, composables, `.d.ts` (strict mode) |
| **JavaScript (ESM)** | ES2020  | Majority of components and stores                              |

### Data / API layer

| Technology                  | Version | Role                                               |
| --------------------------- | ------- | -------------------------------------------------- |
| **Axios**                   | 1.13.2  | HTTP client for the **Redfish** REST API           |
| **axios-cache-interceptor** | 1.11.2  | Response caching                                   |
| **@tanstack/vue-query**     | 5.92.9  | Async state / caching for new Redfish composables  |
| **Redfish (DMTF)**          | —       | The BMC management API domain (OData query params) |

### Forms & validation

| Technology                | Version | Role             |
| ------------------------- | ------- | ---------------- |
| **@vuelidate/core**       | 2.0.3   | Form validation  |
| **@vuelidate/validators** | 2.0.4   | Validation rules |

### Styling

| Technology             | Version | Role                                         |
| ---------------------- | ------- | -------------------------------------------- |
| **Sass (SCSS)**        | 1.97.2  | Theming, custom styles (`src/assets/styles`) |
| **Bootstrap**          | 5.3.8   | Design system base                           |
| **bootstrap-vue-next** | 0.40.8  | Vue 3 Bootstrap components                   |
| **@carbon/icons-vue**  | 10.49.1 | Icon set                                     |

### Tooling / build / test

| Technology                   | Version | Role                                     |
| ---------------------------- | ------- | ---------------------------------------- |
| **Vite**                     | 6.4.1   | Dev server + build                       |
| **Vitest**                   | 3.2.4   | Unit test runner                         |
| **@vue/test-utils**          | 2.4.5   | Component testing                        |
| **vue3-snapshot-serializer** | 2.13.0  | Snapshot formatting                      |
| **ESLint**                   | 9.18.0  | Linting (flat config, eslint-plugin-vue) |
| **Prettier**                 | 3.4.2   | Formatting (md/json/yaml + via ESLint)   |
| **VuePress**                 | 1.9.7   | Docs site generator                      |

### Specialized / feature libs

| Technology                     | Version        | Role                          |
| ------------------------------ | -------------- | ----------------------------- |
| **xterm** + addons             | 4.19.0         | Serial-over-LAN / SOL console |
| **@novnc/novnc**               | 1.3.0          | KVM (virtual console)         |
| **date-fns** / **date-fns-tz** | 2.28.0 / 1.3.6 | Date formatting + timezones   |
| **lodash**                     | 4.17.21        | Utilities                     |
| **mitt**                       | 3.0.1          | Event bus (`src/eventBus.js`) |
| **js-cookie**                  | 3.0.1          | Cookie handling (auth)        |

---

## Project facts every review must respect

- **Code review happens in Gerrit, not GitHub PRs.** Commits need a
  `Signed-off-by` line and a well-formed commit message (50-char subject,
  imperative mood, body wrapped at 72 chars).
- **Accessibility is a first-class requirement** (project goal). See
  [technologies/accessibility.md](technologies/accessibility.md).
- **i18n is mandatory** — no hardcoded user-facing strings; use `$t()` keys.
- **Theming-friendly** — avoid hardcoded colors; use SCSS variables/tokens.
- **Node** `>=18.18.0`.
- CI runs `format-code.sh` (JS, Vue, md, json, yaml) + ESLint after push to
  Gerrit.
