# Accessibility Review Skill — webui-vue

Accessibility is a **core project goal** (replacing phosphor-webui). Guidance
lives in `docs/guide/coding-standards/accessibility.md`. Target: **WCAG 2.1
AA**. Apply this guide to every `*.vue` change with user-facing markup.

## Must-haves

- **Semantic HTML first** — use `<button>`, `<nav>`, `<main>`, `<table>`,
  headings in order. Don't fake controls with `<div @click>` (no keyboard/role).
- **Labels:** every form control has an associated `<label>` (or `aria-label`).
  Icon-only buttons need an accessible name (`aria-label`, translated).
- **Keyboard:** all interactive elements reachable and operable by keyboard;
  logical tab order; visible focus indicator (don't remove `:focus` outlines).
- **ARIA for state:** `aria-invalid`, `aria-describedby` for form errors;
  `aria-expanded`/`aria-controls` for disclosures; `aria-live` regions for async
  status/toasts so screen readers announce changes.
- **Images/icons:** meaningful images have `alt`; decorative ones use `alt=""` /
  `aria-hidden`.
- **Color:** never use color alone to convey meaning (pair with icon/text); meet
  AA contrast (ties to `scss-bootstrap.md`).
- **Tables:** proper `<th scope>` headers; status icons have text alternatives
  (see `StatusIcon` component).
- **Motion:** respect `prefers-reduced-motion`.

## Review points

- New interactive UI is operable without a mouse; focus is managed on
  modal/dialog open/close (focus trap, return focus on close).
- Dynamic content (loading bars, toasts, validation errors) announced via live
  regions.
- All a11y text (`aria-label`, alt) is **translated** via i18n.
- Headings don't skip levels; one `<h1>` per page (page title).
- bootstrap-vue-next components used with their accessibility props, not
  stripped.

## Review checklist

- [ ] Semantic elements used; no `div`-as-button.
- [ ] Every control labeled; icon-only buttons have translated `aria-label`.
- [ ] Fully keyboard operable; visible focus; logical tab order.
- [ ] Form errors wired via `aria-invalid` + `aria-describedby`.
- [ ] Async status/toasts in `aria-live` regions.
- [ ] Meaningful alt text; decorative images hidden from AT.
- [ ] No color-only meaning; AA contrast met.
- [ ] Modals trap focus and restore it on close.
- [ ] `prefers-reduced-motion` respected.
