# TypeScript Review Skill — webui-vue

TypeScript **5.9.3**, **strict mode on** (`tsconfig.json`: `"strict": true`,
`target ES2020`, `module ESNext`, path alias `@/* → src/*`). TS is used in
`src/api/**`, newer composables, and `*.d.ts` files (`i18n.d.ts`,
`store/api.d.ts`, `store/api.js` typings). Most `.vue`/store files are still JS
— don't demand a rewrite.

## Type safety

- No implicit/explicit `any` unless justified with a comment. Prefer `unknown` +
  narrowing.
- Avoid non-null assertions (`!`) — handle null/undefined explicitly (strict
  mode catches these).
- Use `interface`/`type` for Redfish payloads (see `src/api/types/redfish.ts`
  and the `RedfishCollection<T>`, `RedfishQueryParameters` interfaces in
  `src/api/composables/useRedfishCollection.ts`).
- Generic functions/composables should be properly parameterized
  (`useFetch<User[]>(...)`), not returning `any`.

## API / Redfish typing

- Redfish responses use OData keys like `@odata.id`, `@odata.type`,
  `Members@odata.count` — keep these typed as string-literal keys, don't
  silently drop them.
- When building query strings, keep `$`-prefixed OData directives **unencoded**,
  but `encodeURIComponent` the user-supplied values (`$filter`, `$select`
  values). This is a correctness + injection concern — verify in
  `buildQuery`-style helpers.

## Imports & modules

- Use the `@/` alias for `src` imports (configured in both `tsconfig.json` and
  Vite).
- `isolatedModules` is on → use `import type { … }` for type-only imports.
- No circular imports between store modules / composables.

## Common review points

- Discriminated unions over boolean flags for state machines
  (loading/error/success).
- Don't widen types to `string`/`number` when a literal union is meaningful
  (e.g. power states, health statuses from Redfish).
- Exported public functions/composables should have explicit return types.

## Review checklist

- [ ] No unjustified `any`; `unknown` + narrowing used at boundaries.
- [ ] No unsafe `!` non-null assertions hiding real null cases.
- [ ] Redfish/API payloads are typed; OData keys preserved.
- [ ] User values encoded, OData `$` directives not encoded.
- [ ] `import type` used for type-only imports (isolatedModules).
- [ ] `@/` alias used; no deep relative `../../../` chains where alias fits.
- [ ] Generics parameterized; exported APIs have explicit return types.
