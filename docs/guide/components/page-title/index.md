# Page title
The `<page-title>` component will automatically render the page title that
corresponds with the title property set in the route record's meta field in
`src/router/routes.js`.

```js
// src/router/routes.js
  {
    path: '',
    name: 'login',
    component: Login,
    meta: {
      title: i18n.t('appPageTitle.login'),
    },
  },
```

Optional page descriptions can be included by using the description prop
`:description` prop and passing in the i18n localized text string. Translations
are found in the `src/locales` folder.

``` vue
// Example: `src/views/AccessControl/Ldap/Ldap.vue`
  <page-title :description="$t('pageLdap.pageDescription')" />
```

[View the page title component source
code](https://github.com/openbmc/webui-vue/blob/master/src/components/Global/PageTitle.vue).
