# Vue I18n Review Skill — webui-vue

Vue I18n **11.2.8**. Locale files live in `src/locales/` (`en-US.json`,
`ru-RU.json`, `ka-GE.json`). i18n is **mandatory** — internationalization is a
core project goal. `vue-i18n-extract` (`npm run i18n:report`) reports
missing/unused keys.

## Hard rules

- **No hardcoded user-facing strings.** Every label, button, heading, toast,
  error, tooltip, table header, and ARIA text must use `$t('key')` (template) or
  `i18n.global.t('key')` (JS/store).
- **Add keys to `en-US.json` at minimum.** `en-US` is the source of truth;
  missing keys show raw key strings to users.
- Keep the **JSON key hierarchy** aligned with the feature area (e.g.
  `pageHardwareStatus.*`). Match existing nesting conventions.
- Use **named interpolation** (`{name}`) and pluralization features rather than
  string concatenation.

## Review points

- New strings added in code → corresponding keys added to locale file(s).
- No string concatenation to build sentences (breaks translation grammar/order).
- Dates/times formatted via `date-fns` / `useDataFormatter`, not manual
  locale-specific formatting.
- Don't leave orphaned/unused keys; don't duplicate an existing key with a new
  name.
- Pluralization handled with i18n plural syntax, not `if (count === 1)`.
- Error/toast messages from store actions use translated text.

## Review checklist

- [ ] No hardcoded UI strings — all via `$t()` / `i18n.global.t()`.
- [ ] New keys present in `en-US.json` (and other locales if provided).
- [ ] Key naming matches the feature's existing hierarchy.
- [ ] Interpolation/pluralization used instead of concatenation.
- [ ] `npm run i18n:report` would show no new missing keys.
- [ ] ARIA labels and tooltips are also translated.
