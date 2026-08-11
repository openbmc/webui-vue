# Vue Router Review Skill — webui-vue

Vue Router **4.6.3**. Routes are defined in `src/router/routes.js` and wired in
`src/router/index.js`. Environment overrides can swap routes via the Vite
`CUSTOM_ROUTER` mechanism (`src/env/router/<envName>.js`).

## Conventions

- Each route has a `meta` block — notably `meta.title` (i18n key for the page
  title) and auth flags. Keep titles as translation keys, not literals.
- Navigation guards enforce authentication/authorization (login redirect,
  privilege checks). New protected pages must be covered by the existing guard
  logic.
- Lazy-load route components with dynamic `import()` to keep the initial bundle
  small, consistent with existing routes.
- Layouts (`AppLayout`, `ConsoleLayout`, `LoginLayout`) wrap routes — pick the
  correct layout for the new page.

## Review points

- **Auth/privilege:** does the new route need a guard? Pages exposing privileged
  BMC operations must be gated by privilege checks (see `usePrivilegeCheck`).
- **Title & breadcrumb:** `meta.title` set with an i18n key; breadcrumb/nav
  updated.
- **Navigation registered:** new page added to `AppNavigation` where
  appropriate.
- **No param injection:** route params used in API calls must be
  validated/encoded.
- **Redirects:** unknown routes resolve to `PageNotFound`.
- **Avoid logic in guards** that should live in the store; keep guards thin.

## Review checklist

- [ ] Route lazy-loaded; correct layout chosen.
- [ ] `meta.title` uses an i18n key, not a hardcoded string.
- [ ] Auth/privilege guard applied to protected/privileged pages.
- [ ] Navigation entry + breadcrumb updated.
- [ ] Route params validated/encoded before use in Redfish calls.
- [ ] Unknown paths fall through to `PageNotFound`.
