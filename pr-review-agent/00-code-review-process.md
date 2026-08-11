# Code Review Process (always loaded)

Adapted from `awesome-skills/code-review-skill` for the **webui-vue**
repository.

## Review mindset

**Goals:** catch bugs & edge cases, ensure maintainability, share knowledge,
enforce standards, improve design. **Not goals:** show off, nitpick formatting
(linters do that), block progress unnecessarily, rewrite to personal preference.

Give feedback that is specific, actionable, educational (not judgmental),
focused on the code (not the person), and prioritized.

## The 4-phase review flow

```text
Phase 1 — Context Gathering
  Read the commit message + linked issue. Check diff size (>400 lines? suggest split).
  Confirm CI / format-code.sh / ESLint pass. Understand the BMC feature being changed.
        |
        v
Phase 2 — High-Level Review
  Architecture fit · performance impact · file placement · test strategy.
  Route to the relevant technology guide(s) for the changed files.
        |
        v
Phase 3 — Line-by-Line Review
  Logic & edge cases · security (XSS, auth, sensitive data) · maintainability ·
  reuse (is there an existing composable/mixin/util?) · a11y · i18n.
        |
        v
Phase 4 — Summary & Decision
  Summarize concerns, highlight good work, give a clear decision + action items.
```

## Severity labels (use these in every comment)

| Label             | Meaning                                         |
| ----------------- | ----------------------------------------------- |
| 🔴 `[blocking]`   | Must be fixed before merge                      |
| 🟠 `[important]`  | Should be fixed; may block depending on context |
| 🟡 `[nit]`        | Minor style/preference; not blocking            |
| 🔵 `[suggestion]` | Optional improvement worth considering          |
| 📚 `[learning]`   | Educational note, no action required            |
| 🌟 `[praise]`     | Explicitly highlight great work                 |

## Feedback technique — ask, don't command

- ❌ "This will fail if the list is empty." → ✅ "What happens if `items` is
  empty?"
- ❌ "Extract this into a function." → ✅ "This logic appears in 3 places —
  would a shared composable make sense?"

## What NOT to review manually (let tooling handle it)

- Formatting / indentation → Prettier + `format-code.sh`
- Import order, simple lint rules → ESLint (`eslint-plugin-vue`)
- Simple typos

## webui-vue specific gates (check on every PR)

- [ ] Commit message has `Signed-off-by` and follows the 50/72 rule.
- [ ] No hardcoded user-facing strings — uses `$t()` / locale keys.
- [ ] No hardcoded colors / pixel values that break theming — uses SCSS tokens.
- [ ] Accessible: labels, focus, ARIA, keyboard support (see
      `accessibility.md`).
- [ ] Unit tests updated/added; snapshots reviewed (not blindly regenerated).
- [ ] No secrets, tokens, or BMC credentials committed or logged.
