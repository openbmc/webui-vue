# Page Anatomy

Single-file components (SFC) consist of a template, script and style. When creating a new page, each template consists of at least 3 components: `b-container`, `page-title`and `page-section`. Use the `fluid="xl"` prop on `b-container` to render a container that is always 100% width on larger screen sizes. The `page-title` component receives a page title from the `routes` that corresponds with the components name in the scripts section of the SFC. To add a description, use the `:description` prop and set to the required locale message. The same is done for adding a `:section-title` to the `page-section` component.

In the scripts section, be sure to import the `PageTitle` and `PageSection` components. Styles should be scoped to the SFC.

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

<style lang="scss" scoped> </style>
```
