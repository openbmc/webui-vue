# PR Review Output Template

Use this exact structure for every review produced by the webui-vue PR Review
Skill.

---

## Review: `<one-line description of what the change does>`

**Changed files**

- `path/to/file1.vue`
- `path/to/file2.ts`

**Sections applied:** Vue 3 · TypeScript · Accessibility _(list only what was
loaded)_

**High-level assessment**

> 2–3 sentences: does the change fit the architecture, any big-picture concerns,
> overall quality signal.

---

## Findings

_Group by file. Order within each file: 🔴 → 🟠 → 🟡 → 🔵 → 📚 → 🌟_

### `path/to/file.vue`

> **🔴 [blocking]** `:42` — `"Save changes"` is a hardcoded string. This breaks
> i18n, which is a core project requirement. Move it to `en-US.json` under
> `pageSettings.saveChanges` and use `$t('pageSettings.saveChanges')`.

> **🟠 [important]** `:88` — `this.powerstate = data.PowerState` recasts a
> Redfish PascalCase property to camelCase. Per the Redfish-first approach, keep
> `PowerState` in PascalCase and read it directly in the template. Would using
> the property directly cause any issues here?

> **🟡 [nit]** `:14` — `:key="index"` on `v-for`. Using the array index as a key
> can cause rendering issues when items are reordered. If items have a stable
> `Id` or `@odata.id`, use that instead.

> **🌟 [praise]** `:31` — Clean use of `useQuery` with a stable query key that
> includes the resource path. Exactly the Redfish-first + Vue Query pattern we
> want.

### `path/to/store/FooStore.js`

> **🟠 [important]** `:57` — Error is swallowed silently in the catch block.
> Store actions should catch, log, and re-throw a translated error so the view
> can surface a toast. See §5 of the ruleset.

---

## Universal gates

| Gate                                           | Status                             |
| ---------------------------------------------- | ---------------------------------- |
| i18n — no hardcoded strings                    | ❌ see finding line 42             |
| Theming — no hardcoded colors                  | ✅                                 |
| Accessibility                                  | ✅                                 |
| Tests added/updated                            | ⚠️ no test change for new behavior |
| No secrets committed/logged                    | ✅                                 |
| Reuses existing composables/Global components  | ✅                                 |
| Migration target (Composition API / Vue Query) | ✅                                 |
| Redfish-first (PascalCase, used directly)      | ❌ see finding line 88             |
| Security (no v-html, params encoded)           | ✅                                 |
| Failures toasted; loading shown                | ✅                                 |
| Page anatomy (new pages only)                  | N/A                                |

---

## Decision

**🔄 Request changes**

Top action items before merge:

1. Replace hardcoded `"Save changes"` string with `$t()` key.
2. Remove the `PowerState → powerstate` camelCase recast; use RF directly.
3. Add a unit test for the new polling behavior.

_Once those are resolved, this is ready to re-review._

---

_Severity reference_

| Label             | Meaning                                    |
| ----------------- | ------------------------------------------ |
| 🔴 `[blocking]`   | Must fix before merge                      |
| 🟠 `[important]`  | Should fix; may block depending on context |
| 🟡 `[nit]`        | Minor / preference; not blocking           |
| 🔵 `[suggestion]` | Optional improvement                       |
| 📚 `[learning]`   | Educational note; no action needed         |
| 🌟 `[praise]`     | Explicitly highlight great work            |
