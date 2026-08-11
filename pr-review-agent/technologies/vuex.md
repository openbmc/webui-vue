# Vuex Review Skill — webui-vue

Vuex **4.1.0**. The store (`src/store/index.js`) is composed of **namespaced
modules** grouped by feature area: `HardwareStatus/`, `Operations/`,
`Settings/`, `SecurityAndAccess/`, `Logs/`, `Authentication/`, plus
`GlobalStore`. New feature state generally belongs in a new/existing namespaced
module, registered in `index.js`.

## Module structure conventions

A store module exports
`{ namespaced: true, state, getters, mutations, actions }`.

- **state** — a function returning the initial object (so it's not shared).
- **getters** — derived/read access. Components read via mapped getters.
- **mutations** — the **only** place that synchronously changes state. Name in
  `SET_*` style.
- **actions** — async work (Redfish calls via `api`), then `commit` a mutation.
  Actions return promises so views can `await dispatch(...)` and show toasts.

```js
// pattern used across modules
export default {
  namespaced: true,
  state: { items: [] },
  getters: { items: (state) => state.items },
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items;
    },
  },
  actions: {
    async getItems({ commit }) {
      return await api
        .get('/redfish/v1/...')
        .then(({ data }) => commit('SET_ITEMS', mapData(data)))
        .catch((error) => {
          console.log(error);
          throw new Error(i18n.global.t('...'));
        });
    },
  },
};
```

## Review points

- **State only mutated in mutations.** Actions must `commit`, never assign state
  directly.
- **New module registered** in `src/store/index.js` with a sensible namespace
  key.
- **Errors:** actions catch, log, and re-throw a translated user message (so the
  view can surface a toast). Don't swallow errors silently.
- **No business logic in components** that belongs in the store; views dispatch
  actions and map getters.
- **No duplicate API calls** — reuse existing actions/getters rather than
  fetching the same Redfish resource in multiple modules.
- **Reactivity:** replace arrays/objects wholesale in mutations; don't
  index-assign in a way Vuex can't track.
- Avoid putting huge non-serializable objects (sockets, terminals) in the store.

## Testing impact (see testing-vitest.md)

- Tests `createStore` with the modules/getters/actions they need. Vuex requires
  all referenced namespaced modules to exist even if stubbed — adding a new
  namespace may require updating test setup.

## Review checklist

- [ ] New module is `namespaced: true` and registered in `index.js`.
- [ ] State changed only through `SET_*` mutations.
- [ ] Async logic in actions; actions return promises.
- [ ] Errors caught, logged, and re-thrown as translated messages.
- [ ] Getters used for derived state; no heavy computation in components.
- [ ] No duplicated fetching of the same Redfish resource.
- [ ] Related unit tests / store mocks updated.
