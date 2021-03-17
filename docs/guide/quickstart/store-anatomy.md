# Store Anatomy

## Store

A "store" is a container that holds the application's state. [Learn more about
Vuex.](https://vuex.vuejs.org/)

```sh
# Store structure
└── store
    ├── api.js                             # axios requests
    ├── index.js                           # import store modules
    ├── plugins
    └── modules
        └── FeatureName                    # feature module
            ├── FeatureStore.js            # feature store
            ├── AdditionalFeatureStore.js  # additional features per store
            ├── AnotherFeatureStore.js     # additional features per store
```

### Modules

The application store is divided into modules to prevent the store from getting
bloated. Each module contains its own state, mutations, actions, and getters.
[Learn more about Vuex modules.](https://vuex.vuejs.org/guide/modules.html)

#### Module Anatomy

- **State:** You cannot directly mutate the store's state. [Learn more about
  state.](https://vuex.vuejs.org/guide/state.html)
- **Getters:** Getters are used to compute derived state based on store state.
  [Learn more about getters.](https://vuex.vuejs.org/guide/getters.html)
- **Mutations:** The only way to mutate the state is by committing mutations,
  which are synchronous transactions. [Learn more about
  mutations.](https://vuex.vuejs.org/guide/mutations.html)
- **Actions:** Asynchronous logic should be encapsulated in, and can be composed
  with actions. [Learn more about
  actions.](https://vuex.vuejs.org/guide/actions.html)

Import new store modules in `src/store/index.js`.

```js
// `src/store/index.js`

import Vue from 'vue';
import Vuex from 'vuex';

import FeatureNameStore from './modules/FeatureNameStore';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    feature: FeatureNameStore, // store names can be renamed for brevity
  },
});
```

## Complete store

A store module will look like this.

```js
import api from '@/store/api';
import i18n from '@/i18n';

const FeatureNameStore = {
  // getters, actions, and mutations will be namespaced
  // based on the path the module is registered at
  namespaced: true,
  state: {
    exampleValue: 'Off',
  },
  getters: {
    // namespace -> getters['featureNameStore/getExampleValue']
    getExampleValue: state => state.exampleValue,
  },
  mutations: {
    // namespace -> commit('featureNameStore/setExampleValue)
    setExampleValue: state => state.exampleValue,
  },
  actions: {
    // namespace -> dispatch('featureNameStore/getExampleValue')
    async getExampleValue({ commit }) {
      return await api
        .get('/redfish/v1/../..')
        .then(response => {
          commit('setExampleValue', response.data.Value);
        })
        .catch(error => console.log(error));
    },
    // namespace -> ('featureNameStore/saveExampleValue', payload)
    async saveExampleValue({ commit }, payload) {
      return await api
        .patch('/redfish/v1/../..', { Value: payload })
        .then(() => {
          commit('setExampleValue', payload);
        })
        .catch(error => {
          console.log(error);
        });
    },
  },
};

export default FeatureNameStore;
```
