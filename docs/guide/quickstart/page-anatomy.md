# Page Anatomy
Single-file components (SFC) consist of a `template`, `script` and `style` block.

## Template block
When creating a new page, each template consists of at least 3 components:
- `<b-container>`
- `<page-title>`
- `<page-section>`

### Page container
Use the `fluid="xl"` prop on the `<b-container>` component to render a container that is always 100% width on larger screen sizes. Importing `BContainer` in the [scripts block](#scripts-block) is not required as it is already registered globally.

[Learn more about BootstrapVue containers](https://bootstrap-vue.org/docs/components/layout#responsive-fluid-containers).

### Page title component
By including the `<page-title>` component in the template, it will automatically render the page title that corresponds with the title property set in the route record's meta field.

Optional page descriptions can be included by using the description prop `:description` prop and passing in the i18n localized text string.

### Page section component
The `<page-section>` component will render semantic HTML. By adding a `:section-title` prop to the `<page-section>` component, the localized text string will be rendered in an `h2` header element.
```vue
<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageName.pageDescription')"/>
    <page-section :section-title="$t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </b-container>
</template>
```

## Scripts block
In the scripts section, be sure to import the `PageTitle` and `PageSection` components and declare them in the `components` property.
```vue
<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
export default {
  name: 'PageName',
  components: { PageTitle, PageSection }
};
</script>
```

## Style block
Add the `scoped` attribute to the style block to keep the styles isolated to the SFC. While the `scoped` attribute is optional, it is preferred and global changes should be done in global style sheets.
```vue
<style lang="scss" scoped> </style>
```

## Complete single-file component (SFC)
The final SFC will look like this.
```vue
<template>
  <b-container fluid="xl">
    <page-title :description="$t('pageName.pageDescription')"/>
    <page-section :section-title="$t('pageName.sectionTitle')">
      // Page content goes here
    </page-section>
  </b-container>
</template>
<script>
import PageTitle from '@/components/Global/PageTitle';
import PageSection from '@/components/Global/PageSection';
export default {
  name: 'PageName',
  components: { PageTitle, PageSection }
};
</script>
<style lang="scss" scoped>
    .example-class {
      /* Styles go here */
    }
 </style>
```