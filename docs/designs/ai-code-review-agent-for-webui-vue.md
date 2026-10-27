# AI code-review agent for `webui-vue`

Author: Aravinth Sri Krishna Raja Raghavan (Discord: `<discord-nick>`)

Other contributors: None

Created: September 18, 2026

## Problem Description

Gerrit review on `openbmc/webui-vue` catches recurring issues: hardcoded
user-facing strings that skip `$t()`, hardcoded colours that break theming,
camelCase remappers over Redfish objects, missing ARIA / keyboard support,
`console.log`ged tokens, and Vuex modules added where Vue Query or a composable
would do. Mechanical issues such as translation coverage and token logging
belong in automated tooling; the proposed skill focuses on project-specific
judgments that those checks cannot make. Contributors currently discover the
rules after they push. This document proposes a small, in-tree code-review skill
that any AI chat (GitHub Copilot, Claude Code, ChatGPT, Gemini, or a web chat)
can load to review a diff **before** it reaches Gerrit. Goal: give contributors
fast local feedback grounded in the same rules a maintainer would enforce.
Non-goals: replacing human review, adding a runtime or CI dependency, and
re-teaching the AI generic Vue 3 / TypeScript / Prettier rules the model and the
linter already know.

## Background and References

`openbmc/webui-vue` already documents its house style in `docs/guide/` (coding
standards, accessibility, forms, page anatomy, unit testing, i18n, theming). The
Redfish-first data-layer design ([Gerrit 94472][94472]) recently added a
contributor contract: views bind Redfish resources directly, and Vuex remappers
are deprecated in favour of Vue Query, Pinia, and composables. Neither those
docs nor that design change how a contributor is reminded of the rules while
they are still editing code.

AI code-review skills are the current mechanism for that reminder. Anthropic
publishes an in-tree "skill" format for Claude ([anthropics/skills][skills],
notably the `frontend-design` skill). The community `awesome-skills` collection
([awesome-skills/code-review-skill][awesome-skills]) shows the same idea. Those
skills are generic; they teach an AI a framework it usually already knows. What
is missing for `webui-vue` is a **project-specific** skill: one that points the
AI at DSP0266, `docs/guide/accessibility.md`, `docs/guide/quickstart/forms.md`,
the Redfish-first design, and the theming tokens, and asks it to enforce only
those rules. Rules that a stock model plus `eslint` plus `prettier` plus
`format-code.sh` already cover are out of scope by construction.

Glossary:

- **Skill**: a small Markdown ruleset (plus optional templates) that a user
  attaches to an AI chat as context so the AI applies those rules to subsequent
  messages.
- **Rule routing table**: a mapping from a changed-file glob (for example
  `**/*.vue`) to the specific project checks and the `docs/guide/` or design
  references that govern it, so the skill loads only what the diff needs.
- **Project-specific rule**: a rule that generic model knowledge does not cover,
  such as Redfish-first naming, `page-title` / `page-section` anatomy,
  `AccessDeniedAlert`, and BMC-specific security constraints.

## Requirements

The skill must be usable from any AI chat: an in-editor tool (VS Code Copilot,
Cursor, Windsurf), a CLI (Claude Code), and a web chat (ChatGPT, Gemini,
Claude.ai). That rules out anything that depends on a bespoke runtime, a plugin
API, or a hosted server. A contributor with a diff and a browser must be able to
review that diff.

The skill must live in `openbmc/webui-vue`. The rules the skill enforces change
with the code, and a design document alone cannot carry that change history.
Placing it beside the code also means the skill and the `docs/ guide/` material
it references move together in the same Gerrit review.

The skill must only enforce **project-specific rules**. Duplicating Vue 3,
TypeScript, or Prettier tutorials into the tree makes the skill bulky and stale,
and it was the specific concern raised on the earlier attempt ([Gerrit
93394][93394]). Anything the AI can already quote from public docs, and anything
`eslint` / `prettier` / `format-code.sh` already enforces, stays out.

The skill must reference existing `docs/guide/*.md` and design docs rather than
restating them. When `docs/guide/accessibility.md` changes, the skill's
accessibility behaviour changes with it. That keeps `docs/guide/` as the
intended source of truth for contributors and reviewers, human or AI. The
current guide must first be audited and updated where it is incomplete or out of
date; the skill must not treat undocumented or stale guidance as settled policy.
The follow-on change must update the affected guide pages alongside the skill
and identify any remaining documentation gaps.

The skill must treat diffs as untrusted data, not instructions. It must tell
contributors to review and sanitize the diff before sending it to an external AI
service, exclude `.env` files, keys, credentials, dumps, and other sensitive
material, and ignore instructions embedded in the code or diff being reviewed.

The skill must produce output that is easy to act on in a Gerrit review:
findings grouped by file with a severity label (`blocking` / `important` / `nit`
/ `suggestion` / `praise`), a link back to the rule, and a final Approve /
Comment / Request-changes decision.

Non-requirements: no CI integration or runtime privilege enforcement, no
automatic posting to Gerrit, no runtime dependency, and no requirement that
every contributor use the same AI. The skill may still review whether a change
relies on hidden UI instead of server-side privilege enforcement.

## Proposed Design

The skill lives in `skills/webui-vue-code-review/` inside `openbmc/webui-vue`,
with activation steps in `CONTRIBUTING.md`. It has four canonical pieces and
small discovery pointers for supported agent types:

1. `SKILL.md` — activation instructions (how to attach it in each AI tool) and
   the top-level review flow. Small: one screen.
2. `code-review-process.md` — the four-phase review flow (Context, High-level,
   Line-by-line, Summary) and the severity labels. Shared between AI reviews and
   human reviews.
3. `output-template.md` — the exact output format a review must follow so that
   findings can be pasted into Gerrit as review comments.
4. `rule-routing.md` — a **routing table** that maps changed-file globs to all
   relevant project rules, including concrete review checks and the references
   that support them. The AI loads only the sections relevant to the diff.
5. Small files in agent-specific discovery locations (for example,
   `.cursor/rules/` and `.github/copilot-instructions.md`) that point to the
   canonical skill. They must not duplicate its rules. `CONTRIBUTING.md` must
   explain activation in each supported tool.

```text
     Contributor diff (reviewed and sanitized first)
        |
        v
   SKILL.md  ---- activation, review flow entry point
        |
        v
     rule-routing.md  ---- file patterns to focused checks and references
        |
        v
   output-template.md  ---- severity-labelled findings + decision
        |
        v
   Contributor fixes findings, pushes to Gerrit
```

The routing file must contain a concrete mapping like this, not just a list of
links:

| Changed files                                 | Review checks                                                                                                                                                                                 | References                                                                                                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `**/*.vue`                                    | Semantic elements, labelled controls, keyboard and ARIA behavior; page anatomy and shared-component reuse; direct Redfish naming/data flow where applicable; theme tokens in component styles | `docs/guide/coding-standards/accessibility.md`, `docs/guide/quickstart/page-anatomy.md`, `docs/guide/guidelines/colors.md`, Redfish-first design |
| `src/api/**` and Redfish-consuming components | Preserve Redfish property casing and resource shape; avoid remappers and reduced DTOs; encode user-provided path segments; do not use hidden UI as authorization                              | Redfish-first design; security guidance to be audited and updated                                                                                |
| `**/*.scss` and Vue `<style>` blocks          | Use theme tokens; report hardcoded colors only where no documented exception applies                                                                                                          | `docs/guide/guidelines/colors.md`                                                                                                                |
| Changed production behavior                   | Determine whether behavior needs a unit test by examining changed source, even when no test file is in the diff; recognize tests matching `tests/unit/**/*.spec.js`                           | `docs/guide/unit-testing/`; Vitest include configuration                                                                                         |
| Legacy Vue code touched by a change           | Flag only patterns documented as deprecated; state whether that area is still migrating                                                                                                       | Vue 2 migration guidance, to be established and maintained in the follow-on change                                                               |
| Locale files and translation references       | No skill finding for translation coverage; rely on scanner/report gates                                                                                                                       | `vue-i18n-scanning` pre-commit hook and `i18n:report`                                                                                            |

Token/credential logging is checked by ESLint, not by this routing table. The
follow-on change must add effective ESLint coverage because `no-console` is
currently off. Privilege-boundary judgments remain in the API and component
routes because they require understanding behavior, not just matching a call.

The routing table is the whole point of the design. A rule lives once, in an
accurate `docs/guide/` page or merged design document, and the skill loads the
relevant references on demand. Each route must state the specific checks to
apply; a bare link is insufficient. In particular, `.vue` changes can touch
accessibility, page anatomy, Redfish data flow, and styling, so they must route
to all applicable guidance rather than only accessibility.

For missing-test review, the skill examines changed production files and whether
their behavior warrants a test; a `tests/**` route alone cannot detect a test
that was never added. The follow-on implementation must use Vitest's actual
include pattern, `tests/unit/**/*.spec.js`, when identifying test files. The
skill must account for Vue 2 patterns only where the guide records them as
deprecated and identifies whether the relevant area is still being migrated; the
follow-on change must establish and maintain that guidance.

Rules the skill will **not** enforce, by construction:

- Formatting, quotes, indentation, import order — `prettier`, `eslint`, and
  `format-code.sh` own these. `format-code.sh` runs `npm install` and
  `npm run lint`, restores `package-lock.json`, and fails if the worktree is
  left dirty; it does not validate commit messages or `Signed-off-by`.
- `$t()` coverage and missing/unused translation checks — `vue-i18n-scanning`
  and `i18n:report` own these. The follow-on change must ensure
  `vue-i18n-scanning` runs on the pre-commit hook.
- Mechanical detection of token/credential logging — ESLint owns this. The
  current `eslint.config.js` sets `no-console` to off, so the follow-on change
  must add or enable effective coverage rather than assume it already exists.
- Generic Vue 3, TypeScript, Bootstrap, `date-fns`, or Vitest tutorials — the AI
  already knows them.
- Commit message format and `Signed-off-by` — the Gerrit `commit-msg` hook owns
  these.

Rules proposed for skill enforcement, subject to the documentation audit:

- Redfish-first (from the Redfish-first design, [Gerrit 94472][94472]): keep
  PascalCase, no camelCase remappers, no reduced subset DTOs, no new Vuex
  modules for BMC data.
- Accessibility (from `docs/guide/coding-standards/accessibility.md`): semantic
  HTML first, labelled controls, keyboard-operable, correct ARIA for state, WCAG
  AA contrast.
- Theming (from `docs/guide/guidelines/colors.md`): no hardcoded colours; use
  SCSS tokens.
- Page anatomy (from `docs/guide/quickstart/page-anatomy.md`):
  `<b- container fluid="xl">` + `<page-title>` + `<page-section>`; reuse Global
  components before authoring new ones.
- Unit tests (from `docs/guide/unit-testing/`): behavior changes are tested in
  the applicable existing suite; snapshot diffs are intentional.
- BMC-specific security judgments: encode user-supplied path segments and do not
  rely on hidden UI as a privilege control (bmcweb enforces privileges).
  Token/credential logging is delegated to ESLint, subject to the coverage
  prerequisite above.
- Vue 2 migration judgments: flag documented deprecated patterns and respect the
  documented status of ongoing migrations; do not label an in-progress migration
  as complete.

The follow-on implementation must include an exception list for approved
deviations from these project rules. Each exception needs a scope, rationale,
and owner or reference so it does not become a blanket waiver. Mechanical checks
delegated to hooks or ESLint are not skill exceptions.

Implementation lands after this design is merged, as a follow-on Gerrit change.
It adds the canonical skill files and agent discovery pointers, updates
`CONTRIBUTING.md` with activation and diff-sanitization steps, audits and
updates the referenced guides, and wires translation scanning and token logging
checks into their stated tooling gates. Keep the skill rules concise by
referencing the audited guides and Redfish-first design rather than copying
their content.

## Alternatives Considered

**Do nothing; rely on human review.** Rejected. The recurring judgment-level
feedback on Gerrit (`PowerState → powerState` remap, missing `aria-label`,
hardcoded colour, a missing unit test) is exactly the class of comment this
skill can pre-empt, freeing maintainers for architectural review. Mechanical
checks such as `$t()` coverage and token logging stay with the linter and i18n
tooling, not the skill. A skill does not replace human review; it removes the
fixable mistakes before a human is asked to look.

**A self-contained standalone skill that duplicates framework knowledge.** This
was the shape of the earlier [Gerrit 93394][93394]. Rejected on that review: the
skill grew to twelve per-technology guides that re-taught Vue 3, TypeScript,
Vuex, Vue Router, Vitest, Bootstrap, and so on. It duplicated content the AI
already knows, it duplicated content already in `docs/guide/`, and it made every
subsequent change land in two places. This design keeps the ruleset thin by
delegating to `docs/guide/` and merged design documents.

**Extend existing lint and i18n reporting only.** This is the right home for
mechanical checks such as translation coverage and token/credential logging, and
the follow-on change must ensure those checks are actually wired into the
pre-commit hook or ESLint. It does not cover judgment calls that a linter cannot
reliably make: whether a Redfish remapping changes the API contract, whether a
page-anatomy exception is justified, or whether a Vuex module contains BMC data.
The skill is retained for those judgments, with an explicit exception list,
rather than duplicating automated checks.

**An external code-review bot (Gerrit hook or CI job that posts comments).**
Rejected. It adds infrastructure, needs a hosted runtime and API credentials,
and does not help the contributor who wants Copilot or Claude to sanity-check a
diff before pushing. It also couples the rules to whichever model the hook is
configured for, which contradicts the "works with any AI" requirement.

## Impacts

**API impact.** None. The skill runs on the contributor's chosen AI tool and
does not touch the BMC.

**Security impact.** There is no direct BMC runtime impact, but there is a real
information-disclosure and prompt-injection risk when contributors send diffs to
consumer AI services. Diffs can contain downstream/proprietary code,
credentials, `.env` values, keys, or dumps. The skill and `CONTRIBUTING.md` must
require contributors to inspect and sanitize the diff, exclude sensitive files
and data, and follow their organization's policy before using an external
service. The review instructions must treat diff contents as untrusted input and
never obey instructions embedded in them. These measures reduce risk but cannot
guarantee that a consumer service is appropriate for every repository or diff.

**Documentation impact.** The follow-on change must first audit and update the
relevant `docs/guide/` pages; they are not automatically authoritative while
incomplete or stale. Every enforced rule must have a current reference and
route. `CONTRIBUTING.md` gains activation steps and the diff-sanitization
warning, and agent-specific pointer files refer back to the canonical skill.

**Performance impact.** None; no runtime, no CI.

**Developer impact.** Contributors get consistent local feedback in the tool
they already use. Reviewers spend less time repeating the same comments. The
skill runs against a local `git diff HEAD`, so a contributor can iterate without
pushing. The contributor must inspect and sanitize that diff before sending it
to an AI service.

**Upgradability impact.** After the relevant guidance has been audited and
updated, rules stay accurate because they live in `docs/guide/` and merged
design documents. When Redfish-first evolves in [Gerrit 94472][94472]
follow-ons, the skill picks up the change because it references the file, not a
copy of it.

### Organizational

- Does this proposal require a new repository? No.
- Who will be the initial maintainer(s) of this repository? The existing
  `openbmc/webui-vue` maintainers.
- Which repositories are expected to be modified to execute this design?
  - `openbmc/docs` — this design document.
  - `openbmc/webui-vue` — the follow-on Gerrit change that adds the skill
    folder, agent discovery pointers, and `CONTRIBUTING.md` activation and
    diff-sanitization instructions.
- No firmware repositories are affected.

## Testing

The skill is developer-side tooling; it is tested by running it against
representative diffs and confirming the AI's findings match reviewer
expectations.

A small fixtures directory in the follow-on `webui-vue` change carries known-bad
and known-good diffs — one per judgment the skill enforces. Fixtures must not
contain real credentials or sensitive downstream code. A maintainer periodically
applies the skill to these fixtures using at least one target AI tool and
confirms the output. Missing-test fixtures must change a production file without
adding a test, to verify that test review is triggered from the source change.
If a fixture stops flagging, that is a signal that either the rule text drifted
or the routing table lost a mapping, and it is fixed in the same Gerrit review.

CI is unchanged.
`npm install && npm run lint && npm run test:unit && npm run build` continues to
be the gate. The follow-on must also verify that `vue-i18n-scanning` runs on the
pre-commit hook and that ESLint detects token/credential logging; `no-console`
is currently off. The skill does not run in CI, does not post to Gerrit, and
does not vote. The Gerrit `commit-msg` hook, not `format-code.sh`, checks commit
message requirements and `Signed-off-by`.

[93394]: https://gerrit.openbmc.org/c/openbmc/webui-vue/+/93394
[94472]: https://gerrit.openbmc.org/c/openbmc/webui-vue/+/94472
[awesome-skills]: https://github.com/awesome-skills/code-review-skill
[skills]: https://github.com/anthropics/skills
