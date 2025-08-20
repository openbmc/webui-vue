BootstrapVue Next Migration TODO

Source reference: BootstrapVueNext Migration Guide —
https://bootstrap-vue-next.github.io/bootstrap-vue-next/docs/migration-guide

Scope: Finish migrating remaining legacy BootstrapVue/Bootstrap 4 patterns;
prefer pure Bootstrap 5 utilities where possible; keep BootstrapVue Next for
components/directives and programmatic APIs.

Checklist

- [x] Replace deprecated BTable prop no-sort-reset → must-sort

  - Hits:
    - `src/views/Logs/PostCodeLogs/PostCodeLogs.vue`
    - `src/views/Logs/EventLogs/EventLogs.vue`
    - `src/views/Logs/Dumps/Dumps.vue`
    - `src/views/HardwareStatus/Sensors/Sensors.vue`
    - `src/views/HardwareStatus/Inventory/InventoryTableAssembly.vue`
    - `src/views/HardwareStatus/Inventory/InventoryTableFans.vue`
    - `src/views/HardwareStatus/Inventory/InventoryTablePowerSupplies.vue`
    - `src/views/HardwareStatus/Inventory/InventoryTableDimmSlot.vue`
    - `src/views/HardwareStatus/Inventory/InventoryTableProcessors.vue`
    - `src/views/SecurityAndAccess/Ldap/TableRoleGroups.vue`
  - Action: Remove no-sort-reset, add must-sort where desired. Validate UX.

- [x] Replace deprecated sort-compare with supported sorting model

  - Hits:
    - `src/views/Logs/EventLogs/EventLogs.vue` (onSortCompare)
    - `src/views/HardwareStatus/Sensors/Sensors.vue` (sortCompare)
    - `src/views/HardwareStatus/Inventory/InventoryTablePowerSupplies.vue`
      (sortCompare)
    - `src/views/HardwareStatus/Inventory/InventoryTableFans.vue` (sortCompare)
    - `src/views/HardwareStatus/Inventory/InventoryTableDimmSlot.vue`
      (sortCompare)
  - Action: Prefer `:sort-by="[...]"` and custom field sorts if needed; remove
    sort-compare per guide.

- [x] Replace $bvModal.msgBoxConfirm with useModal().msgBoxConfirm

  - Completed across all pages using confirmations.

- [x] Replace $bvModal.show/hide with useModal().show/hide

  - Completed where used for programmatic modal display.

- [x] Audit other BTable deprecations (selection-variant, update:sortBy,
      displayedItems, filtered semantics)

  - Ref: BTable section in guide
  - Action: No occurrences found. Removed legacy `:no-border-collapse` from
    `Sensors.vue`.

- [x] Verify BTabs v-model behavior (id vs index) and changed events

  - Action: Check `src/views/Settings/Network/Network.vue` and others using
    tabs.
  - Done: `Network.vue` now uses `v-model:index="tabIndex"`; store sync added.

- [x] Confirm all utility classes use BS5 start/end (done previously); quick
      re-check for regressions

  - Action: run grep sweep for left/right utilities periodically.

- [x] Directives parity check (v-b-toggle, v-b-tooltip, v-b-popover, v-b-modal)

  - Action: Confirm all are registered in `src/main.js` and used per BVN docs.
  - Done: Confirmed registration and usage.

- [x] Show/Hide semantics (prefer v-model for visibility)

  - Action: Migrated remaining BModal usages from `.show()`/`.hide()` to
    `v-model`.
  - Files updated:
    - `src/views/Settings/Network/ModalHostname.vue`
    - `src/views/Settings/Network/ModalDefaultGateway.vue`
    - `src/views/Settings/Network/ModalMacAddress.vue`
    - `src/views/Settings/Network/Network.vue`
    - `src/views/Settings/Network/NetworkGlobalSettings.vue`
    - `src/views/Settings/Network/TableIpv6.vue`
    - `src/views/Settings/Network/NetworkInterfaceSettings.vue`
    - `src/views/Operations/VirtualMedia/ModalConfigureConnection.vue`
    - `src/views/Operations/VirtualMedia/VirtualMedia.vue`
    - `src/views/Logs/Dumps/DumpsModalConfirmation.vue`
    - `src/views/Logs/Dumps/DumpsForm.vue`
    - `src/views/SecurityAndAccess/UserManagement/ModalUser.vue`
    - `src/views/SecurityAndAccess/UserManagement/ModalSettings.vue`
    - `src/views/SecurityAndAccess/UserManagement/UserManagement.vue`
  - Verification: grep shows no remaining `.show(` calls; build is green.

- [x] Revisit any custom SCSS relying on Bootstrap 4 internals
  - Action: Validated against Bootstrap 5.
    - Confirmed logical properties are used across tables, alerts, toasts,
      buttons, pagination, grid.
    - Updated `src/assets/styles/bmc/custom/_forms.scss` to include
      `.form-select` alongside legacy `.custom-select` so both variants share
      the same theming.
    - Grep audit found no remaining `text-left/right`, `float-left/right`,
      `pl-/pr-`, `ml-/mr-`, `border-left/right`, or `rounded-left/right`
      utilities. One-off occurrences are already using logical props (e.g.,
      `margin-inline-start`, `padding-inline-start`, `inset-inline-end`).

Notes

- Migration guide emphasizes breaking changes in utilities and deprecations
  mirrored by BootstrapVueNext; keep preferring native Bootstrap classes and
  patterns.
