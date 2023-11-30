# Build Customization

This document provides instructions for how to add environment specific
modifications to the Web UI.

- [Setup](#setup)
- [Store](#store)
- [Router](#router)
- [App Navigation](#app-navigation)
- [Theming](#theming)
- [Local development](#local-development)
- [Production build](#production-build)

## Setup

1. Create a `.env.<ENV_NAME>` file in the project root
2. Add `NODE_ENV=production` key value pair in the file
3. Add `VITE_APP_ENV_NAME` key with the value set to the new environment name

Example `.env.ibm`:

```
NODE_ENV=production
VITE_APP_ENV_NAME=ibm
```

## Store

:::tip [Pinia store](https://pinia.vuejs.org/core-concepts/) contain
the application's API calls. :::

1. If making customizations to the default store, add `CUSTOM_STORE=true` key
   value pair to the new .env file.
2. Create a `<ENV_NAME>.js` file in `src/env/store` :::danger The filename needs
   to match the `VITE_APP_ENV_NAME` value defined in the .env file. The store
   import in `src/main.js` will resolve to this new file. :::
3. Import the base store
4. Import environment specific store modules
5. Add default export


## Router

:::tip [Vue Router](https://router.vuejs.org/guide/) determines which pages are
accessible in the UI. :::

1. If making customizations to the default router, add `CUSTOM_ROUTER=true` key
   value pair to the new .env file.
2. Create a `<ENV_NAME>.js` file in `src/env/router` :::danger The filename
   needs to match the `VITE_APP_ENV_NAME` value defined in the .env file. The
   routes import in `src/router/index.js` will resolve to this new file. :::
3. Define new [routes](https://router.vuejs.org/api/#routes). :::tip Use static
   imports (over lazy-loading routes) to avoid creating separate JS chunks.
   Static imports also helps to keep the total build size down. :::
4. Add default export

## App navigation

The Vue Router definition is closely tied to the app navigation but should be
configured separately. The Vue Router is responsible for defining the
application routes which is not always the same as what is visible in the app
navigation. This configuration will make customizations to the rendered markup
in src/components/AppNavigation/AppNavigation.vue.

1. If making customizations to the app navigation, add `CUSTOM_APP_NAV=true` key
   value pair to the new .env file.
2. Create a `<ENV_NAME>.js` file in `src/env/components/AppNavigation` :::danger
   The filename needs to match the `VITE_APP_ENV_NAME` value defined in the .env
   file. The AppNavigationMixin import in
   `src/components/AppNavigation/AppNavigation.vue` will resolve to this new
   file. :::
3. Your custom mixin should follow a very similar structure to the default
   AppNavigationMixin.js file. It should include a data property named
   `navigationItems` that should be an array of of navigation objects. Each
   navigation object should have an `id` and `label` property defined.
   Optionally it can include `icon`, `route`, or `children` properties.
4. Add default export

## Theming

:::tip
[Bootstrap theming](https://getbootstrap.com/docs/4.5/getting-started/theming/)
allows for easy visual customizations. :::

1. If making customizations to the default styles, add `CUSTOM_STYLES=true` key
   value pair to the new .env file.
2. Create a `_<ENV_NAME>.scss` partial in `src/env/assets/styles` :::danger The
   filename needs to match the `VITE_APP_ENV_NAME` value defined in the .env
   file. The webpack sass loader will attempt to import a file with this name.
   :::
3. Add style customizations. Refer to
   [bootstrap documentation](https://getbootstrap.com/docs/4.5/getting-started/theming/)
   for details about
   [color overrides](https://getbootstrap.com/docs/4.5/getting-started/theming/#variable-defaults)
   and
   [other customizable options](https://getbootstrap.com/docs/4.5/getting-started/theming/#sass-options).

Example for adding custom colors

`src/env/assets/styles/_ibm.scss`

```
// Custom theme colors

$primary: rebeccapurple;
$success: lime;
```

## Local development

1. Add the same `VITE_APP_ENV_NAME` key value pair to your
   `env.local` file.
2. Use serve script
   ```
   npm run serve
   ```

## Production build

Run npm build script with vite `--mode`
[option flag](https://vitejs.dev/guide/env-and-mode.html#modes). This
requires [corresponding .env file to exist](#setup).

```
npm run build -- --mode ibm
```

**OR**

pass env variable directly to script

```
VITE_APP_ENV_NAME=ibm npm run build
```
