# TanStack Vue Query Review Skill — webui-vue

**@tanstack/vue-query 5.92.9**. Used by the newer Redfish composables
(`src/api/composables/useRedfishCollection.ts` etc.) via `useQuery`. This
coexists with the legacy Vuex + Axios data flow — new read-heavy data access
trends toward Vue Query.

## Core rules

- **Query keys** must be stable, serializable, and uniquely identify the data
  (include the resource path + relevant params). Reactive params belong in the
  key so the query refetches when they change.
- Pass **reactive** sources (refs/getters) so queries react to dependency
  changes; don't read `.value` once and lose reactivity.
- Use the `enabled` option to defer queries until prerequisites (auth, an id)
  are ready.
- Don't duplicate caching responsibilities — if Vue Query owns a resource, don't
  also cache the same thing in Vuex.

## Correctness

- Handle `isLoading`/`isError`/`error` in the UI; surface translated error
  messages.
- Invalidate or refetch affected query keys after mutations
  (`queryClient.invalidateQueries`) so the UI reflects writes.
- Set sensible `staleTime`/`gcTime` for BMC data — some resources change rarely
  (inventory), others frequently (sensors, status). Avoid hammering the BMC.
- Avoid waterfalls: parallelize independent queries; use the
  `useAllSubResources`-style helpers for fan-out instead of sequential awaits.

## Review checklist

- [ ] Query key is stable, serializable, and includes all params.
- [ ] Reactive params passed as refs/getters (refetch on change).
- [ ] `enabled` guards queries that depend on auth/ids.
- [ ] Loading/error states handled with translated messages.
- [ ] Mutations invalidate/refetch the right query keys.
- [ ] `staleTime`/`gcTime` tuned to the resource's volatility.
- [ ] No double-caching the same data in both Vuex and Vue Query.
- [ ] No request waterfalls for independent resources.
