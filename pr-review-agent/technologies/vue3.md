# Vue 3 Review Skill — webui-vue

Vue **3.5.24**. This repo mixes **Options API** (most existing components/views)
and **Composition API** (newer composables under `src/components/Composables`
and `src/api/composables`). Templates must use **kebab-case** component names
(enforced by ESLint: `vue/component-name-in-template-casing`).

## Reactivity

- Prefer `ref` for primitives; `ref` is also fine for objects (keeps
  consistency).
- **Never destructure a `reactive()` object** — it loses reactivity. Use
  `toRefs()` or individual `ref`s.
- `computed` must be **pure** — no side effects, no mutating other state inside
  it.
- Large/deeply-nested objects: use `shallowRef` + `triggerRef` to avoid deep
  conversion cost.

```js
// ❌ loses reactivity
const { count, name } = reactive({ count: 0, name: 'Vue' });
// ✅
const state = reactive({ count: 0, name: 'Vue' });
const { count, name } = toRefs(state);
```

## Props & emits

- **Never mutate a prop** directly — emit an event so the parent updates.
- Declare prop types; for objects/arrays provide a factory default.
- In Options API components here, props use the object form with `type`,
  `required`, `default`. Keep `default` factories for objects/arrays.
- Composition API: prefer typed `defineProps<Props>()` + `withDefaults`.
- Vue 3.5 reactive props destructure is available
  (`const { count = 0 } = defineProps(...)`).

## Watchers

- Choose `watch` when you need the old value or lazy execution; `watchEffect`
  when deps are auto-tracked and you want immediate run.
- Async watchers must **clean up** to avoid race conditions — use the
  `onCleanup` callback (or `onWatcherCleanup`) with an `AbortController`.
- Prefer `computed` over watchers for derived state.
- Use `flush: 'post'` for watchers that touch the DOM; `{ once: true }` for
  one-shot.

## Templates

- `v-for` must use a **stable, unique `:key`** (`item.id`), not the array index.
- Don't put `v-if` and `v-for` on the same element — filter with a `computed`
  instead.
- Move complex inline handler logic into methods.
- Use event modifiers (`.prevent`, `.stop`, `.once`, `.enter`).

## Composables (Composition API)

- A composable returns reactive refs (not `.value`); consider `readonly()` for
  state the caller shouldn't mutate.
- Pass props into a composable via `toRef`/getter to keep reactivity.
- Clean up side effects in `onUnmounted` (or `effectScope().stop()`).
- Don't wrap a pure function in a composable just for the naming convention.

## Lifecycle / cleanup (common bug source here)

- Components using **xterm**, **noVNC**, `setInterval`, `addEventListener`,
  WebSockets, or the `mitt` event bus (`src/eventBus.js`) **must remove/clear
  them** in `beforeUnmount`/`onUnmounted`. Leaked listeners are a recurring
  issue in console/KVM views.

## Performance

- Lazy-load heavy components with `defineAsyncComponent`.
- `v-memo` for expensive list rows; `KeepAlive` for cached dynamic components.
- Large tables/lists: prefer pagination or virtual scrolling.

## Review checklist

- [ ] No mutated props; child→parent changes go through emits.
- [ ] No destructured `reactive` without `toRefs`.
- [ ] `computed` is side-effect free.
- [ ] `v-for` has a stable unique key; no `v-if`+`v-for` on same node.
- [ ] Async watchers cancel stale work (`AbortController` + cleanup).
- [ ] Timers / listeners / sockets / event-bus handlers cleaned up on unmount.
- [ ] Template uses kebab-case components; complex logic moved out of template.
- [ ] User-facing text uses `$t()`; no hardcoded strings.
- [ ] Component split sensibly; no giant god-components.
