# Vuelidate Validation Review Skill — webui-vue

**@vuelidate/core 2.0.3** + **@vuelidate/validators 2.0.4**. Used for form
validation across Settings, SecurityAndAccess, ProfileSettings, ChangePassword,
etc. See the forms quickstart (`docs/guide/quickstart/forms.md`).

## Conventions

- Define a `validations` object (Options API) or `useVuelidate(rules, state)`
  (Composition API) mapping each field to its rules.
- Use built-in validators (`required`, `email`, `minLength`, `maxLength`,
  `sameAs`, `helpers.regex`, etc.) before writing custom ones.
- **Validation messages must be translated** (`$t(...)`) — no hardcoded error
  text.
- Bind invalid state to the input (`:state="getValidationState(v$.field)"`) and
  show the message in the field's feedback area for accessibility.

## Review points

- Every user-editable field that has constraints is actually validated (no
  fields relying only on backend rejection).
- `v$.$touch()` called on blur/submit; submit blocked when `v$.$invalid`.
- Async validators (e.g. uniqueness against Redfish) handle pending/error state
  and don't spam the BMC on every keystroke (debounce).
- Password/secret fields: validation rules don't log the value; confirm-password
  uses `sameAs`.
- Error messages are specific and translated; invalid state is conveyed both
  visually and via ARIA (`aria-invalid`, `aria-describedby`) — ties to
  `accessibility.md`.
- Reset validation state (`v$.$reset()`) when the form is cleared/closed.

## Review checklist

- [ ] All constrained fields have Vuelidate rules.
- [ ] Built-in validators reused; custom ones justified and tested.
- [ ] Submit guarded by `v$.$invalid`; `$touch()` on blur/submit.
- [ ] Error messages translated and field-specific.
- [ ] Invalid state exposed to assistive tech
      (`aria-invalid`/`aria-describedby`).
- [ ] Async validators debounced; pending/error handled.
- [ ] Validation reset on form close/clear; secrets never logged.
