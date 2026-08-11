# Testing Review Skill (Vitest) — webui-vue

Vitest **3.2.4** + **@vue/test-utils 2.4.5**. Tests live in `tests/unit/` and
run with `npm run test:unit` (coverage via `@vitest/coverage-v8`). Snapshots use
`vue3-snapshot-serializer`; setup in `tests/vitest.setup.js`. Environment is
`happy-dom` / `jsdom`.

## Conventions (from existing specs)

- Import from `vitest`:
  `import { vi, describe, it, expect, beforeEach } from 'vitest'`.
- Mount with a real test store: `createStore({ actions, getters, modules })`
  passed via `global: { plugins: [store] }`.
- Mock `$t` with `mocks: { $t: (key) => key }`.
- Stub dispatch per test: `beforeEach(() => { store.dispatch = vi.fn(); })`.
- Vuex requires **all referenced namespaced modules to exist** — add fake
  `{ namespaced: true }` modules for ones the component touches.
- Use `vi.fn()` for action spies; assert with `wrapper.emitted(...)`,
  `wrapper.get('#id')`, `trigger('click')`, and `await wrapper.vm.$nextTick()`.

## Review points

- **New/changed component or store logic must have tests.** A PR adding behavior
  with no test update is a 🟠 flag.
- **Snapshots:** reviewer should confirm snapshot diffs are intentional — not
  blindly regenerated to make tests pass. Large unexplained snapshot churn is a
  flag.
- **Async:** await `$nextTick()` / promises before asserting; no missing `await`
  causing flaky passes.
- **Real assertions:** avoid tests that only check `exists()`; cover the actual
  behavior, edge cases, and error paths.
- **Mocks cleaned up:** reset spies between tests (`beforeEach`), no leaking
  state across tests.
- Don't mock the thing under test; mock its collaborators (store actions, API).
- Coverage shouldn't regress for touched files.

## Review checklist

- [ ] Behavior/bug fix is covered by a new or updated test.
- [ ] Snapshot changes are intentional and reviewed, not noise.
- [ ] Async waits (`$nextTick`, awaited promises) present — no flakiness.
- [ ] All referenced Vuex namespaces stubbed; `$t` mocked.
- [ ] Spies/mocks reset between tests.
- [ ] Tests assert real outcomes (emitted events, rendered output), not just
      existence.
- [ ] Edge cases and error states tested, not just the happy path.
