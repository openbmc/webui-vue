# SCSS / Bootstrap Styling Review Skill — webui-vue

Sass **1.97.2** (SCSS), **Bootstrap 5.3.8**, **bootstrap-vue-next 0.40.8**,
Carbon icons. Styles live in `src/assets/styles/` (`bmc/`, `bootstrap/`,
`_obmc-custom.scss`). Vite prepends helper imports via `scssAdditionalData` (bmc
helpers + bootstrap helpers, plus env-specific styles when
`CUSTOM_STYLES=true`). **Theming is a core project feature** — styles must stay
overridable.

## Hard rules

- **No hardcoded colors / hex values** in components. Use existing SCSS
  variables / theme tokens so brand themes can override them.
- **No magic pixel values** where spacing/utility variables or Bootstrap utility
  classes exist. Prefer Bootstrap spacing utilities and the project's variables.
- Prefer **Bootstrap / bootstrap-vue-next components & utilities** over bespoke
  CSS when one already exists.
- Component `<style>` blocks should be **scoped** unless intentionally global;
  global overrides belong in `src/assets/styles`.

## Review points

- New colors → added as variables in the theme layer, not inline.
- Respect existing helper/partial structure (`bmc/helpers`,
  `bootstrap/_helpers`); don't duplicate mixins.
- `prefers-reduced-motion` respected for animations/transitions (a11y + project
  motion guidelines).
- Responsive: layout works down to mobile widths (Bootstrap grid/breakpoints).
- Sufficient color contrast (WCAG AA) — ties into `accessibility.md`.
- Avoid `!important` unless overriding third-party styles with justification.
- SCSS is formatted by **Prettier** (`*.scss` in lint-staged) — don't hand-fight
  formatting.

## Review checklist

- [ ] No hardcoded hex colors; theme variables/tokens used.
- [ ] Reuses Bootstrap / bootstrap-vue-next components & utilities where
      available.
- [ ] `<style>` scoped appropriately; globals placed in the styles layer.
- [ ] No unjustified `!important`.
- [ ] `prefers-reduced-motion` handled for animation.
- [ ] Responsive down to mobile; AA contrast met.
- [ ] No duplicated mixins/partials; existing helpers reused.
