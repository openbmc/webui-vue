# Configuring environment specific builds

This document provides instructions for how to add environment specific modifications to the Web UI.

- [Setup](#setup)
- [Store](#store)
- [Router](#router)
- [Theming](#theming)
- [Local development](#local-development)
- [Production build](#production-build)

## Setup

1. Create a `.env.<ENV_NAME>` file in the project root
2. Add `NODE_ENV=production` key value pair in the file
3. Add `VUE_APP_ENV_NAME` key with the value set to the new environment name

Example `.env.ibm`:

```
NODE_ENV=production
VUE_APP_ENV_NAME=ibm
```

## Store

>[Vuex store modules](https://vuex.vuejs.org/guide/modules.html) contain the application's API calls.

1. If making customizations to the default store, add `CUSTOM_STORE=true` key value pair to the new .env file.
2. Create a `<ENV_NAME>.js` file in `src/env/store`
    >The filename needs to match the `VUE_APP_ENV_NAME` value defined in the .env file. The store import in `src/main.js` will resolve to this new file.
3. Import the base store
4. Import environment specific store modules
5. Use the [Vuex](https://vuex.vuejs.org/api/#registermodule) `registerModule` and `unregisterModule` instance methods to add/remove store modules
6. Add default export

Example `src/env/store/ibm.js`:

```
import store from '@/store; //@ aliases to src directory
import HmcStore from './Hmc/HmcStore';

store.registerModule('hmc', HmcStore);

export default store;
```

## Router

>[Vue Router](https://router.vuejs.org/guide/) determines which pages are accessible in the UI.

1. If making customizations to the default router, add `CUSTOM_ROUTER=true` key value pair to the new .env file.
2. Create a `<ENV_NAME>.js` file in `src/env/router`
    >The filename needs to match the `VUE_APP_ENV_NAME` value defined in the .env file. The router import in `src/main.js` will resolve to this new file.
3. Import the base router
4. Use the [Vue Router](https://router.vuejs.org/api/#router-addroutes) `addRoutes` instance method to define new routes
5. Add default export

Example `src/env/router/ibm.js`:

```
import router from '@/router'; //@ aliases to src directory
import AppLayout from '@/layouts/AppLayout';

router.addRoutes([
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '/access-control/hmc',
        component: () => import('../views/Hmc'),
        meta: {
          title: 'appPageTitle.hmc'
        }
      }
    ]
  }
]);

export default router;
```

## Theming

>[Bootstrap theming](https://getbootstrap.com/docs/4.5/getting-started/theming/) allows for easy visual customizations.

1. If making customizations to the default styles, add `CUSTOM_STYLES=true` key value pair to the new .env file.
2. Create a `_<ENV_NAME>.scss` partial in `src/env/assets/styles`
    >The filename needs to match the `VUE_APP_ENV_NAME` value defined in the .env file. The webpack sass loader will attempt to import a file with this name.
3. Add style customizations. Refer to [bootstrap documentation](https://getbootstrap.com/docs/4.5/getting-started/theming/) for details about [color overrides](https://getbootstrap.com/docs/4.5/getting-started/theming/#variable-defaults) and [other customizable options](https://getbootstrap.com/docs/4.5/getting-started/theming/#sass-options).

Example for adding custom colors

`src/env/assets/styles/_ibm.scss`

```
// Custom theme colors

$primary: rebeccapurple;
$success: lime;
```

## Local development

1. Add the same `VUE_APP_ENV_NAME` key value pair to your `env.development.local` file.
2. Use serve script
    ```
    npm run serve
    ```

## Production build

Run npm build script with vue-cli `--mode` [option flag](https://cli.vuejs.org/guide/mode-and-env.html#modes). This requires [corresponding .env file to exist](#setup).


```
npm run build -- --mode ibm
```


**OR**

pass env variable directly to script

```
VUE_APP_ENV_NAME=ibm npm run build
```