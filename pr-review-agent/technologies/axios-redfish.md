# Axios / Redfish API Review Skill — webui-vue

**Axios 1.13.2** + **axios-cache-interceptor 1.11.2**. The configured client
lives in `src/store/api.js` (imported as `@/store/api`). The backend is the
**Redfish** management API (DMTF) served by the BMC; base URL comes from `.env`
(`BASE_URL`). Newer typed access goes through composables in
`src/api/composables/` (`useRedfishCollection`, `useRedfishRoot`,
`useAllSubResources`).

## Redfish / OData specifics

- Resources are under `/redfish/v1/...`. Collections expose `Members`,
  `Members@odata.count`, and members reference `@odata.id`.
- OData query params: `$expand`, `$filter`, `$select`, `$top`, `$skip`, plus
  Redfish `only`/`excerpt`. See `buildQuery()` in `useRedfishCollection.ts`.
- **Encoding rule:** keep `$`-prefixed OData **directives** unencoded, but
  `encodeURIComponent` any **user-supplied values** (filter expressions, select
  fields). Getting this wrong causes broken queries or injection.
- Use `$expand` carefully — over-expanding large collections hurts BMC
  performance.

## Security & correctness

- **Never log or commit** auth tokens, session cookies, passwords, or BMC
  credentials. Auth uses `js-cookie` + session handling in `Authentication`
  store.
- Validate/encode any path segment built from user input before calling the API.
- Handle non-2xx responses: actions should `.catch`, log, and surface a
  translated error (no silent failures).
- Be mindful of caching (`axios-cache-interceptor`) — mutations
  (POST/PATCH/DELETE) must invalidate/refetch stale cached GETs so the UI
  reflects reality.
- Respect long-running BMC operations (firmware update, reboot, dumps) —
  poll/await task monitors rather than assuming instant completion.

## Patterns

- Store actions call `api.get/post/patch/delete`, map the Redfish payload to
  view-model shape, then commit a mutation.
- Prefer the typed composables for new read paths; keep response typing
  (`RedfishCollection<T>`).
- Avoid duplicate requests for the same resource across modules/components.

## Review checklist

- [ ] Uses the shared `@/store/api` client (not a raw `axios` instance).
- [ ] OData directives unencoded; user values `encodeURIComponent`-ed.
- [ ] No secrets/tokens logged or committed; credentials handled via auth store.
- [ ] Non-2xx handled with translated error + logging; no silent catch.
- [ ] Cache invalidation after writes so the UI stays consistent.
- [ ] No over-broad `$expand` on large collections (BMC performance).
- [ ] Long-running tasks awaited/polled correctly.
- [ ] No duplicated fetches of the same Redfish resource.
