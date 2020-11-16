# Page

The essential building blocks of each page, or single-file component, consist of:
- `<b-container>`
- `<page-title>`
- `<page-section>`

```vue
<template>
  <b-container fluid="xl">
    <page-title />
    <page-section :section-title="$t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </b-container>
</template>
```

## Page container
Use the `fluid="xl"` prop on the `<b-container>` component to render a container that is always 100% width on larger screen sizes. [Learn more about BootstrapVue containers](https://bootstrap-vue.org/docs/components/layout#responsive-fluid-containers).

```vue
<template>
  <b-container fluid="xl">
  </b-container>
</template>
```


Within the page container, include the [page title](#/page-title) and [page section](#page-section) components.

## Page title
The `<page-title>` component will automatically render the page title that corresponds with the title property set in the route record's meta field in `src/router/routes.js`.

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

Optional page descriptions can be included by using the description prop `:description` prop and passing in the i18n localized text string. Translations are found in the `src/locales` folder.

``` vue
// Example: `src/views/AccessControl/Ldap/Ldap.vue`
  <page-title :description="$t('pageLdap.pageDescription')" />
```

```vue
// Page title component
// `src/components/Global/PageTitle.vue`
  <template>
    <div class="page-title">
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
  </template>

  <script>
  export default {
    name: 'PageTitle',
    props: {
      description: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        title: this.$route.meta.title,
      };
    },
  };
  </script>

  <style lang="scss" scoped>
  .page-title {
    margin-bottom: $spacer * 2;
  }
  p {
    max-width: 72ch;
  }
  </style>
```

## Page section

The `<page-section>` component will render semantic HTML. By adding a `:section-title` prop to the `<page-section>` component, the localized text string will be rendered in an `h2` header element.

``` vue
// Example: `src/views/AccessControl/Ldap/Ldap.vue`
    <page-section :section-title="$t('pageLdap.settings')">
```

```vue
// Page section component
// `src/components/Global/PageSection.vue`

<template>
  <div class="page-section">
    <h2 v-if="sectionTitle">{{ sectionTitle }}</h2>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'PageSection',
  props: {
    sectionTitle: {
      type: String,
      default: '',
    },
  },
};
</script>

<style lang="scss" scoped>
.page-section {
  margin-bottom: $spacer * 4;
}

h2 {
  @include font-size($h3-font-size);
  margin-bottom: $spacer;
}
</style>
```

Visit the [quick start guide](/guide/quickstart/page-anatomy) to learn more about single-file component page anatomy.