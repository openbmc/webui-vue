<!--
SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Redfish-first data layer for `webui-vue`

Author: Jason Westover (Discord: jasonwestover)

Other contributors: None

Created: September 13, 2026

## Problem Description

`webui-vue` often takes a Redfish JSON document, copies it into a JavaScript
object with different names (`PowerState` becomes `powerState`, `Status.Health`
becomes `health`), stores that copy in Vuex, and teaches every `.vue` file the
copy. The UI then owns a second schema. Firmware and UI developers cannot read a
view and see Redfish; Gerrit diffs cannot be checked against DSP0266; every BMC
quirk hardens into a webui-only shape. That is costly for several reasons,
including:

1. Schema drift. Hand-coded DTOs are very difficult to compare to updates in the
   Redfish schema, which DMTF publishes quarterly.
2. Lost type checking. `webui-vue` has adopted TypeScript, so views can use
   Redfish types and interfaces directly, and the compiler can check objects and
   parameters. Remodeling (or shrinking) the resource into untyped JavaScript
   throws that away. That class of bug is already common: a hardcoded `"off"`
   where the Redfish enum is `"Off"`. Against a Redfish enum type, TypeScript
   compilation fails on that assignment, so the broken code never reaches review
   as a green build.
3. Live updates stay free. SSE cache invalidation can refresh a view when the
   BMC publishes `OriginOfCondition` with no extra per-screen plumbing — but
   only if Vue Query usage is consistent and the view binds the literal Redfish
   model. A remapped copy in Vuex or a subset DTO is a second cache the
   invalidator cannot see, so every new event mapping becomes more developer
   work.

This design forbids that remodeling. The object model is Redfish. Views import
Redfish types (today from `@/api/types/redfish`) and read Redfish properties by
their Redfish names. Vuex is deprecated in favour of Vue Query, composables, and
Pinia as described below.

Non-goals: replacing Axios in this change, rewriting every Vuex module in one
Gerrit review, and privilege checking. OpenAPI codegen and SSE invalidation are
follow-on work (see below), not part of this design.

## Background and References

OpenBMC's reference UI is `webui-vue` (Vue 3 + Vite). The BMC API is [DMTF
Redfish][redfish] ([DSP0266][dsp0266]). Resource and property names are
CamelCase (`ComputerSystem`, `PowerState`, `HealthRollup`, `Members`,
`@odata.id`).

Those shapes are hand-rolled in `src/api/types/redfish.ts` and already preserve
Redfish names. Some composables consume them (`usePowerControl` imports
`Chassis` and `EnvironmentMetrics`). Most Vuex modules still remap — for example
`ChassisStore.setChassisInfo` (`PowerState` → `powerState`) and
`SystemStore.setSystemInfo` (`BiosVersion` → `firmwareVersion`). Codegen does
not, by itself, stop that habit. Developers (and agents) still remap generated
types into camelCase DTOs. This design is the contract those follow-on tools
must keep.

Server-state caching is [TanStack Vue Query][vue-query]. [Pinia][pinia] replaces
Vuex as the application store. Pinia is not a dependency yet; it lands with the
first client-only store, not this design.

Glossary:

- **Redfish resource**: the JSON document at an `@odata.id`, typed as
  `ComputerSystem`, `Chassis`, `Sensor`, and so on.
- **Remodel**: copying that document into a differently named or reduced
  JavaScript object for the UI.
- **Feature composable**: fetches or selects Redfish resources and returns them
  typed. It does not invent a parallel schema.

## Requirements

UI and firmware developers must be able to open a `.vue` file and recognize
DSP0266 fields without a translation table.

Redfish-first naming **trumps** JavaScript camelCase for objects and properties.
Function names that are not Redfish entities (`useRedfishRoot`) may stay
camelCase.

Types come from `@/api/types/redfish` (or generated equivalents later). Views
import those interfaces. They do not declare a local duplicate or a "just the
fields I need" subset.

No new Vuex modules. Axios remains the HTTP transport; composables return the
response body as a Redfish type.

BMC quirks (which `Systems` member, missing `Status.HealthRollup`) live in
composables. The view still binds a Redfish property or enum.

## Proposed Design

Pass the Redfish resource through the UI. Do not clone it into a JavaScript
view-model.

```
  .vue files
      import ComputerSystem, read PowerState / Status
           |
           v
  Composables (optional)
      select / fetch / fallback; still return Redfish types
           |
           v
  Vue Query cache          BMC JSON, Redfish-shaped
           |
           v
  Axios instance           existing auth, ETag, 401
           |
           v
  BMC Redfish
```

Vuex is off this diagram. A leftover getter is deleted in the same change that
moves the view to a composable or `useQuery`.

### Object model

The object model is the Redfish resource.

Correct: the view holds a `ComputerSystem` and uses `ComputerSystem.PowerState`,
`ComputerSystem.Status?.HealthRollup`, `ComputerSystem.SerialNumber`.

Incorrect: `{ powerState, health, serialNumber }` bound as `item.powerState`.

Collections stay collections (`Members`, `@odata.id`). Selecting "the" managed
system is a composable that returns a `ComputerSystem`, not a flattened
`ManagedHost`. UI-only state (form dirty flags, icon blink, selected row) stays
in the component or Pinia; it is not merged into a remodeled copy of the
resource.

### Naming

Redfish CamelCase is the house style: `ComputerSystem`, `Chassis`, `PowerState`,
`HealthRollup`, `@odata.id`.

A local binding uses the Redfish type name. This is the rule agents most often
keep incompletely: they leave `PowerState` alone, then name the variable
`chassis`. Wrong: `chassis.PowerState`. Right: `Chassis.PowerState`. TypeScript
allows the same identifier for the type and the value (`import type { Chassis }`
plus `const Chassis = ...`). Use that. ESLint `camelcase` must allow Redfish
names on typed resources; do not "fix" them in review.

Composable functions stay `usePowerControl` / `useRedfishRoot` because they are
functions, not Redfish objects. Returning a Redfish property as
`PowerState | null` when it is absent is allowed; renaming it is not.

The other trap is a reduced object of only the properties the current screen
needs — `{ PowerState, Health }` instead of `ComputerSystem`. Returning a single
Redfish property is fine. A new subset type is not: it hides the Redfish shape
and bypasses checking against the real interface. Pass the resource through and
let the `.vue` file pick properties.

### Data flow

1. A composable (or `useQuery`) `GET`s `/redfish/v1/Chassis/{Id}`.
2. Vue Query caches the JSON as `Chassis`.
3. The `.vue` file imports `Chassis` and binds `Chassis.PowerState`.
4. A reset is a Redfish action on that resource. After refetch, the same
   property updates. No mapper.

If `Status.HealthRollup` is missing, a composable may fall back to other Redfish
resources (for example `TelemetryService` metric reports) and still return a
Redfish `Health` value (`OK` | `Warning` | `Critical`).

### Extension points

- New Redfish field: add it to `@/api/types/redfish` (or generated types) and
  use it in the `.vue` file.
- Which member to show: a composable that returns the chosen `ComputerSystem` /
  `Chassis`.
- BMC missing a property: fallback in the composable; the view still binds
  Redfish names when the property exists.
- Form / wizard / selection chrome: component state or Pinia.
- Auth, 401, ETag: Axios interceptors, unchanged.
- Privilege gating (later): wrap calls; do not reshape payloads.

### Follow-on work

These come next. They are necessities we are already working, not alternatives
to Redfish-first:

- Generated Redfish types via [`@hey-api/openapi-ts`][hey-api], replacing
  hand-rolled `@/api/types/redfish` with an import-path change. An earlier Orval
  attempt ([Gerrit 86518][gerrit-orval]) showed that a generator without this
  contract still produces remappers.
- SSE → Vue Query cache invalidation.

Until those land, apply this design with the hand-rolled types. After they land,
the same naming and no-remodel rules still apply. Today's hand-rolled types
still use `string` for many Redfish enums (`PowerState?: string`); generated
types are what make `"off"` vs `"Off"` a compile error.

### Vuex deprecation

Vuex is deprecated. Pinia is the replacement store. Prefer Vue Query and
composables for Redfish/server data; use Pinia where that falls short (session
token, locale, and other client-only state are the usual cases).

1. No new Vuex modules or getters for BMC data.
2. Migrate server state to Vue Query. The cache holds the Redfish document.
3. Migrate views off `mapGetters` / `mapState`.
4. Do not lift `SystemStore` into Pinia under new names just to leave Vuex. That
   repeats the remodel.
5. Delete the Vuex module when the last view has moved. One Gerrit change per
   feature.

Existing remappers (`ChassisStore`, `SystemStore`, `BmcStore`, …) are shims to
remove, not patterns to copy.

### Anti-patterns (do not introduce)

- Remodeling Redfish JSON into camelCase objects, reduced subset types, or
  Vuex/Pinia copies of the same map.
- `chassis.PowerState` / `system.PowerState` / `item.health` — bind `Chassis` /
  `ComputerSystem` and Redfish properties.
- Hardcoded enum-like strings that skip the type (`"off"` vs `"Off"`).
- New Vuex modules; defaulting BMC `GET` bodies into Pinia when Vue Query would
  do.
- Treating codegen as a substitute for this contract. Generated types still get
  remodeled unless views bind Redfish names.

## Alternatives Considered

**Keep Vuex remappers as the UI contract.** Rejected: the decoupling _is_ the
maintenance cost (schema drift and lost type checking).

**Move Vuex modules to Pinia unchanged.** Pinia replaces Vuex, but copying
`powerState: PowerState` preserves the wrong object model. Rejected as a default
for server state.

## Impacts

**API impact.** None on the BMC. i18n keys and routes need not change with
property names.

**Security impact.** None. Auth remains on the Axios instance.

**Documentation impact.** This document is the contributor contract. After it is
accepted, `CONTRIBUTING.md` and the style guide should point at it and state
that Vuex is deprecated.

**Performance impact.** Neutral to positive. Dropping the remap removes a copy;
Vue Query deduplicates once a view leaves Vuex.

**Developer impact.** This is a large DX win, not a tax. When the IDE and coding
agents see the Redfish TypeScript types, the editor lights up: completion for
`PowerState` and `Status.HealthRollup`, jump-to-definition into the schema type,
inline docs, and red squiggles for `"off"` vs `"Off"` once those properties are
Redfish enums rather than `string`. A `vue-tsc` check (follow-on with codegen;
today's `npm run build` is Vite and does not type-check) then fails the compile,
so that mismatch cannot land as a "looks fine in review" bug. Agents propose
`Chassis` instead of inventing a DTO. New code is smaller because there is no
mapper to write or keep in sync. Reviews still reject renamed properties and
camelCased bindings. Views will look mixed until Vuex modules are gone.

**Upgradability impact.** Adding a Redfish property is "extend the type, bind it
in Vue". Replacing hand-rolled types with generated types is an import-path
change if this contract was kept.

### Organizational

- Does this proposal require a new repository? No.
- Initial maintainer(s): `webui-vue` maintainers.
- Repositories expected to be modified:
  - `openbmc/webui-vue` — types, composables, views; Vuex removal over stacked
    changes
  - `openbmc/docs` — this design, if the community wants it beside other OpenBMC
    designs
  - no firmware repositories

## Testing

Unit-test composables against fixtures that use Redfish property names
(`PowerState: 'On'`, not `powerState: 'On'`). Do not add mocks shaped like Vuex
remappers.

A feature migration is not done until that view no longer imports the Vuex
module it replaced and no longer binds remodeled names.

CI stays `npm install && npm run lint && npm run test:unit && npm run build`.
This design does not add codegen or `vue-tsc` to CI.

[dsp0266]: https://www.dmtf.org/dsp/DSP0266
[gerrit-orval]: https://gerrit.openbmc.org/c/openbmc/webui-vue/+/86518
[hey-api]: https://heyapi.dev/
[pinia]: https://pinia.vuejs.org/
[redfish]: https://www.dmtf.org/standards/redfish
[vue-query]: https://tanstack.com/query/latest/docs/vue/overview
