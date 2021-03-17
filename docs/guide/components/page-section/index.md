# Page section

The `<page-section>` component will render semantic HTML. By adding a
`:section-title` prop to the `<page-section>` component, the localized text
string will be rendered in an `h2` header element.

``` vue
// Example: `src/views/AccessControl/Ldap/Ldap.vue`
    <page-section :section-title="$t('pageLdap.settings')">
```

[View the page section component source
code](https://github.com/openbmc/webui-vue/blob/master/src/components/Global/PageSection.vue).