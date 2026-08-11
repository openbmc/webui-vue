---
name: webui-vue-pr-review
description: >
  Structured code-review skill for the OpenBMC webui-vue repository. Reviews
  Pull Requests and local changes against project-specific rules: Redfish-first
  data handling, i18n, accessibility (WCAG AA), theming, security (BMC context),
  and the ongoing migration from Vuex/Options API to Pinia/Composition API/Vue
  Query. Covers Vue 3, Vuex, Vue Router, Vue I18n, TypeScript, Axios/Redfish,
  TanStack Vue Query, Vuelidate, SCSS/Bootstrap, Vitest, and more. Use when:
  reviewing a webui-vue change, checking a diff before pushing to Gerrit,
  auditing a .vue / store / composable / scss file.
version: '1.0'
status:
  draft — two sections pending community input (OpenAPI types, Redfish-first
  scope for existing stores)
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# webui-vue PR Review Skill

An AI reviewer for the OpenBMC **webui-vue** front-end. Applies the project's
review rules to a diff and returns severity-labeled, actionable feedback with a
clear decision.

---

## Skill files

| File                                  | When to load            | Purpose                                                              |
| ------------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `PR-REVIEW-SKILL-refined.md`          | **Always — load first** | Full ruleset: process + all 21 technology sections. Source of truth. |
| `technologies/<name>.md`              | On demand               | Deep-dive for a specific technology when the PR needs more detail.   |
| `assets/pr-review-output-template.md` | When writing output     | Output format to follow for every review.                            |

> `PR-REVIEW-SKILL-refined.md` is authoritative. If a `technologies/*.md` file
> ever conflicts with it, prefer the refined skill.

---

## Activation

**GitHub Copilot is not required.** The skill files are plain Markdown — any AI
model or chat interface can apply them. Choose the workflow that fits your
tooling:

### Any AI chat (ChatGPT, Gemini, Claude.ai, etc.)

1. Open `PR-REVIEW-SKILL-refined.md` and copy its full contents.
2. In your AI chat, start a new conversation and paste the skill content.
3. Follow it with the diff or file you want reviewed, e.g.:

   ```text
   Here is my diff — please review it using the skill above:
   <paste diff or file content>
   ```

### Claude Code (CLI)

```text
Use webui-vue-pr-review skill to review this change
```

Or point it at a specific file:

```text
Use webui-vue-pr-review skill to review src/views/Settings/Network/Network.vue
```

### VS Code Copilot

Select the **"webui-vue PR Reviewer"** chat mode from the mode dropdown
(`.github/chatmodes/webui-vue-pr-review.chatmode.md`).

### Cursor / Windsurf / other AI editors

Add `PR-REVIEW-SKILL-refined.md` as context (drag it into the chat panel or use
the `@file` / `#file` reference), then ask:

```text
Review the current diff using the rules in PR-REVIEW-SKILL-refined.md
```

### Command-line (any model via `llm` CLI or similar)

```text
cat pr-review-agent/PR-REVIEW-SKILL-refined.md <(git diff HEAD) | \
  llm "Review this diff using the skill rules above"
```

---

## Review workflow

1. **Load** `PR-REVIEW-SKILL-refined.md`.
2. **Gather the diff** — `git diff HEAD` for local changes; or read the file(s)
   provided.
3. **Route** — use the "Which sections to apply, by changed file" table to load
   only the relevant tech sections. Skip unrelated ones.
4. **Review in 4 phases** — context → high-level → line-by-line → summary.
5. **Apply the universal gates** to every change.
6. **Skip** formatting, lint, Prettier, import order, commit-message format — CI
   and commit hooks enforce those. Don't spend review output on them.
7. **Output** — follow `assets/pr-review-output-template.md`: severity-labeled
   findings with `file:line` and a concrete suggestion, universal-gate checklist
   status, and a final Approve / Comment / Request-changes decision.

---

## Known open items (pending community input)

- **OpenAPI / `openapi.ts`** — migration to generated types is under
  consideration. Marked as a placeholder in the ruleset; do not enforce yet.
- **Redfish-first scope for existing stores** — new code follows the pattern;
  refactoring existing camelCase-mapping Vuex stores is an open question. Do not
  force a refactor on legacy stores.
