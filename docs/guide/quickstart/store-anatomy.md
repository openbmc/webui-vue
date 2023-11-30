# Store Anatomy

## Store

A "store" is a container that holds the application's state.
[Learn more about pinia.](https://pinia.vuejs.org/)

```sh
# Store structure
└── store
    ├── api.js                             # axios requests
    ├── index.js                           # import store modules
    └── modules
        └── FeatureName                    # feature module
            ├── FeatureStore.js            # feature store
            ├── AdditionalFeatureStore.js  # additional features per store
            ├── AnotherFeatureStore.js     # additional features per store
```

### Core Concept

Before diving into core concepts, we need to know that a store is defined using defineStore() and that it requires a unique name, passed as the first argument.
[Learn more about Pinia core concept.](https://pinia.vuejs.org/core-concepts/)

#### Module Anatomy

- **State:** You cannot directly mutate the store's state.
  [Learn more about state.](https://pinia.vuejs.org/core-concepts/state.html)
- **Getters:** Getters are used to compute derived state based on store state.
  [Learn more about getters.](https://pinia.vuejs.org/core-concepts/state.html)
- **Actions:** Asynchronous logic should be encapsulated in, and can be composed
  with actions.
  [Learn more about actions.](https://pinia.vuejs.org/core-concepts/actions.html)

Import new store modules in `src/store/index.js`.

```js
// `src/store/index.js`

import { createPinia } from 'pinia';

const pinia = createPinia();

export const useStore = pinia.useStore;
export default pinia;

```

## Complete store

A store module will look like this.

```js
import api from '@/store/api';
import { defineStore } from 'pinia';

export const featureNameStore = defineStore('global', {
  state: () => ({
    exampleValue: "Off",
  }),
   getters: {
    // namespace -> getters['featureNameStore/getExampleValue']
    getExampleValue: (state) => state.exampleValue,
  },
  actions: {
    // namespace -> dispatch('featureNameStore/getExampleValue')
    async getExampleValue({ commit }) {
      return await api
        .get("/redfish/v1/../..")
        .then((response) => {
          this.exampleValue = response.data.Value;
        })
        .catch((error) => console.log(error));
    },
    // namespace -> ('featureNameStore/saveExampleValue', payload)
    async saveExampleValue({ commit }, payload) {
      return await api
        .patch("/redfish/v1/../..", { Value: payload })
        .then(() => {
          this.exampleValue =  payload;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
})
export default FeatureNameStore;
```
